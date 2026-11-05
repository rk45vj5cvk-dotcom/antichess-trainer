import React, { useState, useEffect, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { completedStudy } from './src/completedStudy';
import { modernDefenseStudy } from './src/modernDefenseStudy';
import { wizardStudy } from './src/wizardStudy';
import { polishStudy } from './src/polishStudy';
import {
  SafeAreaView, ScrollView, View, Text, Pressable, useWindowDimensions,
  TextInput, StyleSheet, Linking,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { pieceSvg } from './src/pieceSvg';
import { parsePgn } from 'chessops/pgn';
import { Antichess } from 'chessops/variant';
import { parseFen, makeFen } from 'chessops/fen';
import { parseSan } from 'chessops/san';
import { parseUci, makeUci, makeSquare } from 'chessops/util';
import type { Role } from 'chessops/types';

type Line = {
  title: string;
  fen: string;
  moves: string[];
  sans: string[];
  comments: string[][];
};
type Attribution = { text: string; sourceUrl: string; licenseUrl: string };
type Course = {
  title: string;
  lines: Line[];
  trainingColor?: 'white' | 'black';
  attribution?: Attribution;
};

const study = completedStudy;

function position(fen: string) {
  return Antichess.fromSetup(parseFen(fen).unwrap()).unwrap();
}

function readCourse(text: string): Course {
  if (!text.trim() || text.length > 500000) {
    throw new Error('Paste a PGN smaller than 500,000 characters.');
  }

  // Reject unknown tokens rather than silently importing a shortened line.
  const tokens = text
    .replace(/^\s*\[[^\n]*\]\s*$/gm, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/;[^\n]*/g, ' ')
    .replace(/\d+\.(?:\.\.)?/g, ' ')
    .replace(/\$\d+/g, ' ')
    .replace(/[()!?]/g, ' ')
    .trim().split(/\s+/);

  for (const token of tokens) {
    const valid = /^(?:\*|1-0|0-1|1\/2-1\/2|(?:O-O(?:-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[KQRBN])?)[+#]?)$/;
    if (!valid.test(token)) {
      throw new Error(`Unsupported PGN token: ${token}`);
    }
  }

  const games = parsePgn(text);
  if (!games.length) throw new Error('No chapters found.');

  const title = games[0].headers.get('StudyName') ||
    games[0].headers.get('Event') || 'Imported study';

  const lines = games.map((game, index) => {
    const label = game.headers.get('ChapterName') || `Chapter ${index + 1}`;
    if (game.headers.get('Variant')?.toLowerCase() !== 'antichess') {
      throw new Error(`${label}: the Variant header must be Antichess.`);
    }
    const name = game.headers.get('StudyName');
    if (name && name !== title) {
      throw new Error('Import one study at a time.');
    }

    const fen = game.headers.get('FEN');
    const start = fen ? position(fen) : Antichess.default();

    // Validate side variations too, while drilling only the main line.
    const pending = [{ node: game.moves, pos: start.clone(), depth: 0 }];
    let visited = 0;
    while (pending.length) {
      const item = pending.pop()!;
      if (++visited > 10000 || item.depth > 1000) {
        throw new Error(`${label}: chapter is too large.`);
      }
      for (const child of item.node.children) {
        const next = item.pos.clone();
        const move = parseSan(next, child.data.san);
        if (!move || !next.isLegal(move)) {
          throw new Error(`${label}: illegal Antichess move ${child.data.san}.`);
        }
        next.play(move);
        pending.push({ node: child, pos: next, depth: item.depth + 1 });
      }
    }

    const pos = start.clone();
    const moves: string[] = [];
    const sans: string[] = [];
    const comments: string[][] = [game.comments || []];
    for (const node of game.moves.mainline()) {
      const move = parseSan(pos, node.san)!;
      moves.push(makeUci(move));
      sans.push(node.san);
      comments.push([
        ...(node.startingComments || []),
        ...(node.comments || []),
      ]);
      pos.play(move);
    }
    if (!moves.length) throw new Error(`${label}: no moves found.`);
    return {
      title: label, fen: makeFen(start.toSetup()),
      moves, sans, comments,
    };
  });
  return { title, lines };
}

const initialCourse = readCourse(study);
const modernDefenseCourse = { ...readCourse(modernDefenseStudy), title: 'Modern Defense' };
const wizardCourse: Course = { ...readCourse(wizardStudy), trainingColor: 'white' };
const polishCourse: Course = {
  ...readCourse(polishStudy), trainingColor: 'black',
  attribution: {
    text: 'Adapted from Cătălin Frâncu’s Nilatac opening book',
    sourceUrl: 'https://catalin.francu.com/nilatac/',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
};
const symbols = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

function openingMoves(course: Course) {
  return course.lines[0]?.sans.slice(0, 2).join(' ') || '';
}

function Button({ title, subtitle, onPress }: {
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return <Pressable style={s.button} onPress={onPress}>
    <Text style={s.text}>{title}</Text>
    {!!subtitle && <Text style={{
      color: '#a9bcc7', fontSize: 13, lineHeight: 19, marginTop: 4,
    }}>{subtitle}</Text>}
  </Pressable>;
}

function SourceCredit({ credit }: { credit: Attribution }) {
  function open(url: string) {
    void Linking.openURL(url).catch(error => console.warn('Could not open source:', error));
  }
  return <View style={{ gap: 4 }}>
    <Text accessibilityRole="link" onPress={() => open(credit.sourceUrl)}
      style={{ color: '#52768a', fontSize: 12 }}>{credit.text}</Text>
    <Text accessibilityRole="link" onPress={() => open(credit.licenseUrl)}
      style={{ color: '#52768a', fontSize: 12 }}>Module licensed CC BY-SA 3.0</Text>
  </View>;
}

function Board({
  line, color, title, chapterIndex, chapterCount,
  onClose, onPreviousChapter, onNextChapter, soundEnabled, onToggleSound, attribution,
}: {
  line: Line;
  color: 'white' | 'black';
  title: string;
  chapterIndex: number;
  chapterCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClose: () => void;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  attribution?: Attribution;
}) {
  const { width, height } = useWindowDimensions();
  const [availableHeight, setAvailableHeight] = useState(height - 90);
  const boardSize = Math.min(
    width - 24,
    Math.max(120, availableHeight - 328)
  );
  const [mode, setMode] = useState<'learn' | 'drill'>('learn');
  const [ply, setPly] = useState(0);
  const [selected, setSelected] = useState<number>();
  const [wrongDestination, setWrongDestination] = useState<number>();
  const [promotionTo, setPromotionTo] = useState<number>();
  const [message, setMessage] = useState('');
  const moveA = useAudioPlayer(require('./assets/Move.wav'));
  const moveB = useAudioPlayer(require('./assets/Move.wav'));
  const captureA = useAudioPlayer(require('./assets/capture.wav'));
  const captureB = useAudioPlayer(require('./assets/capture.wav'));
  const completionPlayer = useAudioPlayer(require('./assets/line-complete.wav'));
  const complete = ply === line.moves.length;
  const wasComplete = useRef(complete);
  const previousPly = useRef(ply);
  const nextSound = useRef(0);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Keep the initial board visible briefly, then supply White's first move
    // when the learner is Black. Also handles restarting in Learn mode.
    if (ply !== 0 || !line.moves.length || position(line.fen).turn === color) return;
    const timer = setTimeout(() => setPly(1), 280);
    return () => clearTimeout(timer);
  }, [ply, color, line]);

  useEffect(() => {
    const justCompleted = complete && !wasComplete.current;
    wasComplete.current = complete;
    if (!justCompleted || !soundEnabled) return;
    let cancelled = false;
    // Let the final move sound finish before the completion click.
    const timer = setTimeout(() => {
      void completionPlayer.seekTo(0).then(() => {
        if (!cancelled) completionPlayer.play();
      }).catch(error => console.warn('Completion sound unavailable:', error));
    }, 120);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [complete, soundEnabled, completionPlayer]);

  function cancelReply() {
    if (replyTimer.current !== undefined) {
      clearTimeout(replyTimer.current);
      replyTimer.current = undefined;
    }
  }

  useEffect(() => {
    return () => {
      if (replyTimer.current !== undefined) {
        clearTimeout(replyTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const advanced = ply > previousPly.current;
    previousPly.current = ply;
    if (!advanced || !soundEnabled) return;

    // Inspect the position before the last move, including en passant captures.
    const before = position(line.fen);
    for (const uci of line.moves.slice(0, ply - 1)) before.play(parseUci(uci)!);
    const move = parseUci(line.moves[ply - 1])!;
    const capture = 'from' in move && (
      before.board.has(move.to) ||
      (before.board.get(move.from)?.role === 'pawn' && before.epSquare === move.to)
    );
    // Alternate players so a reply cannot cut off your move sound.
    const alternate = nextSound.current++ % 2 === 0;
    const player = capture
      ? (alternate ? captureA : captureB)
      : (alternate ? moveA : moveB);
    let cancelled = false;

    async function playSound() {
      try {
        await player.seekTo(0);
        if (!cancelled) player.play();
      } catch (error) {
        console.warn('Move sound unavailable:', error);
      }
    }
    void playSound();
    return () => { cancelled = true; };
  }, [ply, soundEnabled, line, moveA, moveB, captureA, captureB]);

  const [commentFrom, setCommentFrom] = useState(0);

  const pos = position(line.fen);
  for (const uci of line.moves.slice(0, ply)) pos.play(parseUci(uci)!);
  const legalDestinations = selected === undefined ? undefined : pos.dests(selected);
  const lastMove = ply > 0 ? parseUci(line.moves[ply - 1]) : undefined;

  function clearMistake() {
    setWrongDestination(undefined);
    setSelected(undefined);
    setPromotionTo(undefined);
    setMessage('');
  }

  function withOpponentReplies(n: number) {
    const p = position(line.fen);
    for (const uci of line.moves.slice(0, n)) p.play(parseUci(uci)!);
    while (n < line.moves.length && p.turn !== color) {
      p.play(parseUci(line.moves[n++])!);
    }
    return n;
  }

  function reset(next: 'learn' | 'drill') {
    cancelReply();
    clearMistake();
    setMode(next);
    setCommentFrom(0);
    setPly(next === 'drill' ? withOpponentReplies(0) : 0);
    setSelected(undefined);
    setPromotionTo(undefined);
    setMessage('');
  }

  function attempt(to: number, promotion?: Role) {
    if (selected === undefined) return;
    const move = { from: selected, to, ...(promotion ? { promotion } : {}) };
    setPromotionTo(undefined);

    if (!pos.isLegal(move)) {
      setWrongDestination(to);
      setSelected(undefined);
      setMessage('Illegal move. Remember: captures are mandatory when available.');
      return;
    }
    if (makeUci(move) !== line.moves[ply]) {
      setWrongDestination(to);
      setMessage('Legal move, but not the authored line. Try again.');
      setSelected(undefined);
      return;
    }

    cancelReply();
    setWrongDestination(undefined);
    const next = withOpponentReplies(ply + 1);
    setCommentFrom(ply + 1);

    // Show and sound your move first, then the authored reply.
    setPly(ply + 1);
    if (next > ply + 1) {
      replyTimer.current = setTimeout(() => {
        replyTimer.current = undefined;
        setPly(next);
      }, 280);
    }
    setSelected(undefined);
    setMessage(next === line.moves.length
      ? 'Chapter complete! This is the end of the line, not necessarily the game.'
      : 'Correct. The opponent replied from the course.');
  }

  function tap(square: number) {
    if (ply === line.moves.length || pos.turn !== color) return;
    if (pos.board.get(square)?.color === pos.turn) {
      setWrongDestination(undefined);
      setSelected(square);
      setPromotionTo(undefined);
      setMessage('');
      return;
    }
    if (selected === undefined) return;
    if (pos.board.get(selected)?.role === 'pawn' &&
        (square < 8 || square >= 56) &&
        pos.dests(selected).has(square)) {
      setPromotionTo(square);
    } else {
      attempt(square);
    }
  }

  // Keep the latest study commentary visible between annotated moves.
  let commentary = line.comments.slice(commentFrom, ply + 1).flat();
  if (!commentary.length) {
    for (let n = ply; n >= 0; n--) {
      if (line.comments[n]?.length) {
        commentary = line.comments[n];
        break;
      }
    }
  }
  if (complete) commentary = [...commentary, 'Click Next Line.'];

  const squares = Array.from({ length: 64 }, (_, i) =>
    color === 'white'
      ? (7 - Math.floor(i / 8)) * 8 + i % 8
      : Math.floor(i / 8) * 8 + 7 - i % 8);

  const progress = Math.min(1,
    (chapterIndex + ply / line.moves.length) / chapterCount
  );

  return <View
    onLayout={event => {
      const h = event.nativeEvent.layout.height;
      setAvailableHeight(old => Math.abs(old - h) > 1 ? h : old);
    }}
    style={{ flex: 1, padding: 12, gap: 10 }}
  >
    <View style={{
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    }}>
      <Text numberOfLines={1} style={{
        flex: 1, color: '#eeeeee', fontSize: 15, fontWeight: '600',
      }}>{title}</Text>
      <Text style={{ color: '#aaaaaa', fontSize: 12 }}>
        {chapterIndex + 1}/{chapterCount}
      </Text>
      <Pressable accessibilityRole="button"
        accessibilityLabel="Home — training module selection"
        onPress={onClose}
        style={{
          minHeight: 44, paddingHorizontal: 10, justifyContent: 'center',
        }}>
        <Text style={{ color: '#eeeeee', fontSize: 15, fontWeight: '600' }}>
          Home
        </Text>
      </Pressable>
    </View>

    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={{
        height: 4, backgroundColor: '#303033',
        borderRadius: 2, overflow: 'hidden',
      }}
    >
      <View style={{
        width: (progress * 100) + '%',
        height: 4, backgroundColor: '#a855f7',
      }} />
    </View>

    <View style={{
      flex: 1, minHeight: 0,
      backgroundColor: '#ffffff',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <ScrollView
        key={commentary.join('\n')}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        accessibilityLabel="Study commentary"
        showsVerticalScrollIndicator
      >
        {attribution && chapterIndex === 0 && <SourceCredit credit={attribution} />}
        {commentary.length ? commentary.map((comment, i) =>
          <Text key={i} style={{
            color: '#111111', fontSize: 18, lineHeight: 26,
          }}>{comment}</Text>
        ) : <Text style={{
          color: '#666666', fontSize: 17, lineHeight: 24,
        }}>No study comment at this position.</Text>}
      </ScrollView>
      {wrongDestination !== undefined && <Pressable
        accessibilityRole="button"
        accessibilityLabel="Try again"
        onPress={clearMistake}
        style={{
          alignSelf: 'flex-start', marginHorizontal: 16, marginBottom: 12,
          paddingHorizontal: 18, paddingVertical: 10,
          backgroundColor: '#b91c1c', borderRadius: 6,
        }}>
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
          Try again
        </Text>
      </Pressable>}
    </View>

    <View style={{
      width: boardSize, height: boardSize,
      alignSelf: 'center',
    }}>
      <View pointerEvents="none" style={{
        position: 'absolute', left: 0, top: 0,
        width: 16, height: boardSize - 16,
      }}>
        {Array.from({ length: 8 }, (_, i) =>
          <View key={i} style={{
            height: '12.5%', alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: '#aaaaaa', fontSize: 11 }}>
              {makeSquare(squares[i * 8])[1]}
            </Text>
          </View>
        )}
      </View>
      <View pointerEvents="none" style={{
        position: 'absolute', left: 16, bottom: 0,
        width: boardSize - 16, height: 16,
        flexDirection: 'row',
      }}>
        {Array.from({ length: 8 }, (_, i) =>
          <View key={i} style={{
            width: '12.5%', alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: '#aaaaaa', fontSize: 11 }}>
              {makeSquare(squares[56 + i])[0]}
            </Text>
          </View>
        )}
      </View>
      <View style={{
        position: 'absolute', left: 16, top: 0,
        width: boardSize - 16, height: boardSize - 16,
        flexDirection: 'row', flexWrap: 'wrap',
      }}>
      {squares.map(square => {
        const piece = pos.board.get(square);
        return <Pressable
          key={square}
          accessibilityRole="button"
          accessibilityLabel={makeSquare(square) + ' ' +
            (piece ? piece.color + ' ' + piece.role : 'empty') +
            (legalDestinations?.has(square) ? ', legal destination' : '') +
            (wrongDestination === square ? ', incorrect destination' : '')}
          accessibilityState={{ selected: selected === square }}
          onPress={() => tap(square)}
          style={[s.square, {
            backgroundColor: selected === square ? '#e5be50'
              : (Math.floor(square / 8) + square % 8) % 2
                ? '#f0d9b5' : '#b58863',
          }]}
        >
          {lastMove && 'from' in lastMove &&
            (lastMove.from === square || lastMove.to === square) &&
            selected !== square && <View pointerEvents="none" style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
              backgroundColor: 'rgba(255, 244, 143, 0.48)',
            }} />}
          <View pointerEvents="none" style={{
            width: '88%', height: '88%',
          }}>
            {piece && <SvgXml
              xml={pieceSvg[
                (piece.color === 'white' ? 'w' : 'b') +
                ({ king: 'K', queen: 'Q', rook: 'R',
                   bishop: 'B', knight: 'N', pawn: 'P' }[piece.role])
              ]}
              width="100%" height="100%"
            />}
          </View>
          {legalDestinations?.has(square) && <View pointerEvents="none" style={{
            position: 'absolute', width: '28%', height: '28%',
            borderRadius: 100, backgroundColor: 'rgba(95, 95, 95, 0.42)',
          }} />}
          {wrongDestination === square && <Text
            pointerEvents="none"
            style={{
              position: 'absolute', top: 0, right: 1,
              color: '#dc2626', fontSize: 19, lineHeight: 21, fontWeight: '900',
              backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 3,
            }}>×</Text>}
        </Pressable>;
      })}
      </View>
    </View>

    <View style={{ height: 100, gap: 6 }}>
      <Text
        numberOfLines={2}
        accessibilityLiveRegion="polite"
        style={{
          height: 36, color: '#cccccc', fontSize: 12, lineHeight: 17,
        }}
      >
        {message || (mode === 'learn' && ply < line.moves.length
          ? 'Next: ' + line.sans[ply]
          : ply === line.moves.length
            ? 'Chapter complete'
            : 'Play ' + color)}
      </Text>

      {promotionTo !== undefined ? <View style={{
        flexDirection: 'row', justifyContent: 'space-around',
      }}>
        {(['queen', 'rook', 'bishop', 'knight', 'king'] as Role[]).map(role =>
          <Pressable key={role}
            accessibilityLabel={'Promote to ' + role}
            onPress={() => attempt(promotionTo, role)}
            style={{ padding: 8 }}>
            <Text style={{ color: '#ffffff', fontSize: 20 }}>
              {symbols[color][role]}
            </Text>
          </Pressable>)}
      </View> : <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 44,
      }}>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Move sounds"
          accessibilityState={{ checked: soundEnabled }}
          onPress={onToggleSound}
          hitSlop={8}>
          <Text style={{ color: '#eeeeee', fontSize: 13 }}>
            {soundEnabled ? 'Sound on' : 'Muted'}
          </Text>
        </Pressable>
        <Pressable onPress={() => reset(mode)} hitSlop={8}>
          <Text style={{ color: '#eeeeee', fontSize: 14 }}>Restart</Text>
        </Pressable>
        <Pressable
          onPress={() => reset(mode === 'learn' ? 'drill' : 'learn')}
          hitSlop={8}>
          <Text style={{ color: '#c084fc', fontSize: 14 }}>
            {mode === 'learn' ? 'Learn' : 'Drill'}
          </Text>
        </Pressable>
        <Pressable accessibilityLabel="Previous move"
          onPress={() => {
            cancelReply();
            clearMistake();
            const n = Math.max(0, ply - 1);
            setPly(n); setCommentFrom(n); setSelected(undefined);
            setPromotionTo(undefined); setMessage(''); setMode('learn');
          }} hitSlop={8}>
          <Text style={{ color: '#eeeeee', fontSize: 25 }}>‹</Text>
        </Pressable>
        <Pressable accessibilityLabel="Next move"
          onPress={() => {
            cancelReply();
            clearMistake();
            const n = Math.min(line.moves.length, ply + 1);
            setPly(n); setCommentFrom(n); setSelected(undefined);
            setPromotionTo(undefined); setMessage(''); setMode('learn');
          }} hitSlop={8}>
          <Text style={{ color: '#eeeeee', fontSize: 25 }}>›</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={chapterIndex + 1 < chapterCount
            ? 'Next chapter' : 'Return to chapters'}
          onPress={onNextChapter} hitSlop={8}
          style={{
            borderWidth: 2,
            borderColor: complete ? '#4ade80' : 'transparent',
            backgroundColor: complete ? '#14532d' : 'transparent',
            paddingHorizontal: 6, paddingVertical: 7,
          }}>
          <Text style={{ color: '#eeeeee', fontSize: 14 }}>
            Next line
          </Text>
        </Pressable>
      </View>}
    </View>
  </View>;
}

export default function App() {
  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true }).catch(error => {
      console.warn('Audio setup unavailable:', error);
    });
  }, []);
  const [courses, setCourses] = useState<Course[]>([initialCourse, modernDefenseCourse, wizardCourse, polishCourse]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [active, setActive] = useState<number>();
  const [chapter, setChapter] = useState<number>();
  const [color, setColor] = useState<'white' | 'black'>('white');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const course = active === undefined ? undefined : courses[active];

  function importStudy() {
    try {
      const imported = readCourse(input);
      setCourses(old => [...old, imported]);
      setActive(courses.length);
      setChapter(0);
      setInput('');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    }
  }

  if (course && chapter !== undefined) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: '#090909' }}>
      <Board
        key={active + ':' + chapter + ':' + color}
        line={course.lines[chapter]}
        color={color}
        title={course.title}
        chapterIndex={chapter}
        chapterCount={course.lines.length}
        soundEnabled={soundEnabled}
        attribution={course.attribution}
        onToggleSound={() => setSoundEnabled(value => !value)}
        onClose={() => { setChapter(undefined); setActive(undefined); }}
        onPreviousChapter={() => setChapter(Math.max(0, chapter - 1))}
        onNextChapter={() => {
          if (chapter + 1 < course.lines.length) {
            setChapter(chapter + 1);
          } else {
            setChapter(undefined);
            setActive(undefined);
          }
        }}
      />
    </SafeAreaView>;
  }

  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.brand}>ANTICHESS TRAINER</Text>
      {!course ? <>
        <Text style={s.heading}>Your courses</Text>
        {courses.map((item, i) =>
          <Button key={i}
            title={`${item.title} · ${item.lines.length} chapters`}
            subtitle={openingMoves(item)}
            onPress={() => {
              setColor(item.trainingColor ?? 'white');
              setActive(i); setChapter(0);
            }} />)}
        <Text style={s.heading}>Import another study</Text>
        <Text style={s.text}>
          Paste an Antichess PGN. Extra imports last until the app reloads.
          Suicide Defense, Modern Defense, Wizard Opening, and Polish Defense are included automatically.
        </Text>
        <TextInput
          accessibilityLabel="PGN text"
          multiline value={input} onChangeText={setInput}
          placeholder="Paste PGN here" placeholderTextColor="#a9bcc7"
          style={s.input}
        />
        <Button title="Import course" onPress={importStudy} />
        {!!error && <Text accessibilityLiveRegion="polite" style={s.comment}>{error}</Text>}
      </> : <>
        <Button title="Home"
          onPress={() => { setChapter(undefined); setActive(undefined); }} />
        <Text style={s.heading}>{course.title}</Text>
        <Text style={{ color: '#a9bcc7', fontSize: 13 }}>{openingMoves(course)}</Text>
        {chapter === undefined ? <>
          <Button title={`Train as ${color} — tap to switch`}
            onPress={() => setColor(color === 'white' ? 'black' : 'white')} />
          {course.lines.map((line, i) =>
            <Button key={i} title={`${line.title} · ${line.moves.length} plies`}
              onPress={() => setChapter(i)} />)}
        </> : <>
          <Text style={s.comment}>{course.lines[chapter].title}</Text>
          <Text style={s.text}>Select a chapter to begin.</Text>
        </>}
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0c141c' },
  content: { padding: 20, paddingBottom: 50, gap: 16 },
  brand: { color: '#62d3bb', fontSize: 16, fontWeight: '800' },
  heading: { color: '#f3f7f7', fontSize: 25, fontWeight: '800' },
  text: { color: '#f3f7f7', fontSize: 16, lineHeight: 23 },
  comment: { color: '#a9bcc7', fontSize: 16, lineHeight: 24 },
  section: { gap: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { backgroundColor: '#213645', padding: 14, borderRadius: 10 },
  input: {
    minHeight: 150, color: '#f3f7f7', borderWidth: 1,
    borderColor: '#34505b', padding: 12, borderRadius: 10,
    textAlignVertical: 'top',
  },
  board: {
    width: '100%', aspectRatio: 1,
    flexDirection: 'row', flexWrap: 'wrap',
  },
  square: {
    width: '12.5%', height: '12.5%',
    alignItems: 'center', justifyContent: 'center',
  },
  piece: { fontSize: 30, color: '#14212b' },
  coordinate: {
    position: 'absolute', bottom: 0, left: 2,
    fontSize: 8, color: '#263831',
  },
});
