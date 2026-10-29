import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, Pressable, useWindowDimensions,
  TextInput, StyleSheet,
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
type Course = { title: string; lines: Line[] };

const study = `
[Event "Punishing the Suicide Defense: Chapter 1"]
[StudyName "Punishing the Suicide Defense"]
[ChapterName "Chapter 1"]
[Variant "Antichess"]
[FEN "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1"]
[SetUp "1"]
[Result "*"]

{ The Suicide defense is one of black's choices for responding to the most popular opening in antithesis: e3. It is not a good choice for black! Play e3 }
1. e3 b5 2. Bxb5 Bb7
{ Black's Bb7 is the start of the Suicide Defense. Let's learn how to punish this mistake. } *

[Event "Punishing the Suicide Defense: Chapter 2"]
[StudyName "Punishing the Suicide Defense"]
[ChapterName "Chapter 2"]
[Variant "Antichess"]
[FEN "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1"]
[SetUp "1"]
[Result "*"]

1. e3 b5 2. Bxb5 Bb7 3. Bxd7
{ Black will always take with the bishop. If black takes the white bishop with one of his pieces, it's an immediate win for white. }
3... Bxg2 4. Bxe8
{ Black has two choices here, both roughly equivalent: Bxh1 or Qxd2. If Qxd2, white just recaptures. Of course, white has four choices so we'll talk about those. For this trainer, we will continue by having black take with the bishop. Nothing changes, however, if black reverses the order. }
4... Bxh1 5. Bxf7 Qxd2
{ Here, white plays either Bxd2 or Kxd2. The one thing you want to avoid is Bxg8 because it'll lose you the game. }
6. Bxd2 *
`;

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
const symbols = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable style={s.button} onPress={onPress}>
    <Text style={s.text}>{title}</Text>
  </Pressable>;
}

function Board({
  line, color, title, chapterIndex, chapterCount,
  onClose, onPreviousChapter, onNextChapter,
}: {
  line: Line;
  color: 'white' | 'black';
  title: string;
  chapterIndex: number;
  chapterCount: number;
  onClose: () => void;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
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
  const [promotionTo, setPromotionTo] = useState<number>();
  const [message, setMessage] = useState('');
  const [commentFrom, setCommentFrom] = useState(0);

  const pos = position(line.fen);
  for (const uci of line.moves.slice(0, ply)) pos.play(parseUci(uci)!);

  function withOpponentReplies(n: number) {
    const p = position(line.fen);
    for (const uci of line.moves.slice(0, n)) p.play(parseUci(uci)!);
    while (n < line.moves.length && p.turn !== color) {
      p.play(parseUci(line.moves[n++])!);
    }
    return n;
  }

  function reset(next: 'learn' | 'drill') {
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
      setMessage('Illegal move. Remember: captures are mandatory when available.');
      return;
    }
    if (makeUci(move) !== line.moves[ply]) {
      setMessage('Legal move, but not the authored line. Try again.');
      setSelected(undefined);
      return;
    }

    const next = withOpponentReplies(ply + 1);
    setCommentFrom(ply + 1);
    setPly(next);
    setSelected(undefined);
    setMessage(next === line.moves.length
      ? 'Chapter complete! This is the end of the line, not necessarily the game.'
      : 'Correct. The opponent replied from the course.');
  }

  function tap(square: number) {
    if (ply === line.moves.length) return;
    if (pos.board.get(square)?.color === pos.turn) {
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
      <Pressable accessibilityLabel="Close training" onPress={onClose}
        hitSlop={10}>
        <Text style={{ color: '#aaaaaa', fontSize: 24 }}>×</Text>
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
        {commentary.length ? commentary.map((comment, i) =>
          <Text key={i} style={{
            color: '#111111', fontSize: 18, lineHeight: 26,
          }}>{comment}</Text>
        ) : <Text style={{
          color: '#666666', fontSize: 17, lineHeight: 24,
        }}>No study comment at this position.</Text>}
      </ScrollView>
    </View>

    <View style={{
      width: boardSize, height: boardSize,
      alignSelf: 'center',
      flexDirection: 'row', flexWrap: 'wrap',
    }}>
      {squares.map(square => {
        const piece = pos.board.get(square);
        return <Pressable
          key={square}
          accessibilityRole="button"
          accessibilityLabel={makeSquare(square) + ' ' +
            (piece ? piece.color + ' ' + piece.role : 'empty')}
          onPress={() => tap(square)}
          style={[s.square, {
            backgroundColor: selected === square ? '#e5be50'
              : (Math.floor(square / 8) + square % 8) % 2
                ? '#f0d9b5' : '#b58863',
          }]}
        >
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
          <Text style={s.coordinate}>{makeSquare(square)}</Text>
        </Pressable>;
      })}
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
            const n = Math.max(0, ply - 1);
            setPly(n); setCommentFrom(n); setSelected(undefined);
            setPromotionTo(undefined); setMessage(''); setMode('learn');
          }} hitSlop={8}>
          <Text style={{ color: '#eeeeee', fontSize: 25 }}>‹</Text>
        </Pressable>
        <Pressable accessibilityLabel="Next move"
          onPress={() => {
            const n = Math.min(line.moves.length, ply + 1);
            setPly(n); setCommentFrom(n); setSelected(undefined);
            setPromotionTo(undefined); setMessage(''); setMode('learn');
          }} hitSlop={8}>
          <Text style={{ color: '#eeeeee', fontSize: 25 }}>›</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={chapterIndex + 1 < chapterCount
            ? 'Next chapter' : 'Return to chapters'}
          onPress={onNextChapter} hitSlop={8}>
          <Text style={{ color: '#eeeeee', fontSize: 14 }}>
            {chapterIndex + 1 < chapterCount ? 'Next line' : 'Done'}
          </Text>
        </Pressable>
      </View>}
    </View>
  </View>;
}

export default function App() {
  const [courses, setCourses] = useState([initialCourse]);
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
      setChapter(undefined);
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
        onClose={() => setChapter(undefined)}
        onPreviousChapter={() => setChapter(Math.max(0, chapter - 1))}
        onNextChapter={() => setChapter(
          chapter + 1 < course.lines.length ? chapter + 1 : undefined
        )}
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
            onPress={() => { setActive(i); setChapter(undefined); }} />)}
        <Text style={s.heading}>Import another study</Text>
        <Text style={s.text}>
          Paste an Antichess PGN. Extra imports last until the app reloads.
          Your Suicide Defense study is included automatically.
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
        <Button title={chapter === undefined ? '← All courses' : '← Chapters'}
          onPress={() => chapter === undefined
            ? setActive(undefined) : setChapter(undefined)} />
        <Text style={s.heading}>{course.title}</Text>
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
