import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { catalog } from './src/sampleData';
import { Course, MONTHLY_USD } from './src/models';

type Screen = 'catalog' | 'course' | 'drill' | 'membership';
const colors = { bg: '#0c141c', card: '#182733', card2: '#213645', ink: '#f3f7f7', muted: '#a9bcc7', accent: '#62d3bb', border: '#34505b' };

function Action({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={[s.button, secondary && s.buttonSecondary]}>
    <Text style={[s.buttonLabel, secondary && { color: colors.ink }]}>{label}</Text>
  </Pressable>;
}
function Panel({ children }: { children: React.ReactNode }) { return <View style={s.panel}>{children}</View>; }
function Heading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return <View style={{gap: 8, marginBottom: 22}}>
    <Text style={s.eyebrow}>{eyebrow.toUpperCase()}</Text><Text style={s.h1}>{title}</Text>
    {!!desc && <Text style={s.sub}>{desc}</Text>}
  </View>;
}
export default function App() {
  const [screen, setScreen] = useState<Screen>('catalog');
  const [course, setCourse] = useState<Course>(catalog[0]);
  const [lineIndex, setLineIndex] = useState(0);
  const back = () => setScreen(screen === 'drill' ? 'course' : 'catalog');
  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="light-content" />
    <View style={s.topbar}><Text style={s.brand}>↗  ANTICHESS</Text><Pressable onPress={() => setScreen('membership')}><Text style={s.topLink}>PRO  •  $5/mo</Text></Pressable></View>
    <ScrollView contentContainerStyle={s.content}>
      {screen === 'catalog' && <>
        <Heading eyebrow="Train smarter" title="Own your opening." desc="Master long antichess lines, one repetition at a time." />
        <Panel><Text style={s.eyebrow}>YOUR COURSES</Text><Text style={s.h2}>Opening repertoire</Text><Text style={s.sub}>Courses are authored as ordered chapters in Lichess Antichess studies.</Text></Panel>
        {catalog.map(item => <Pressable key={item.id} style={s.course} onPress={() => {setCourse(item);setScreen('course');}}>
          <View style={s.courseIcon}><Text style={{fontSize: 32, color: colors.ink}}>♞</Text></View>
          <View style={{ flex: 1, gap: 5 }}><Text style={s.h3}>{item.title}</Text><Text style={s.subSmall}>{item.lines.length} demonstration chapters · {item.repertoireColor} repertoire</Text><Text style={s.eyebrow}>OPEN COURSE  →</Text></View>
        </Pressable>)}
        <Panel><Text style={s.h3}>Bring your Lichess studies</Text><Text style={s.sub}>PGN import is the next development milestone. Each study becomes a course; each chapter becomes an ordered drill line.</Text></Panel>
      </>}
      {screen === 'course' && <>
        <Action label="← All courses" secondary onPress={back}/>
        <Heading eyebrow="Opening course" title={course.title} desc={course.description}/>
        <Panel><Text style={s.h3}>{course.lines.length} sample chapters</Text><Text style={s.sub}>Training sequence: foundation → branches → deeper continuations. These are placeholders, not playable repertoire lines.</Text></Panel>
        {course.lines.map((item, i) => <Pressable key={item.id} style={s.line} onPress={() => {setLineIndex(i);setScreen('drill');}}>
          <View style={s.circle}><Text style={s.circleNumber}>{i+1}</Text></View>
          <View style={{flex:1}}><Text style={s.h3}>{item.title}</Text><Text style={s.subSmall}>Chapter {item.chapterOrder} · not yet imported</Text></View><Text style={s.arrow}>→</Text>
        </Pressable>)}
      </>}
      {screen === 'drill' && <>
        <Action label="← Course" secondary onPress={back}/>
        <Heading eyebrow={`Chapter ${lineIndex+1} of ${course.lines.length}`} title={course.lines[lineIndex].title} desc="Drilling engine not yet connected."/>
        <View style={s.board} accessibilityLabel="Chessboard placeholder; interactive antichess board is not yet implemented">
          {Array.from({length:64}, (_, n) => <View key={n} style={[s.square, {backgroundColor: (Math.floor(n/8)+n%8)%2 ? '#a6b3ac':'#e8e5d6'}]}/>)}
          <View style={s.boardOverlay}><Text style={s.overlayTitle}>Board engine pending</Text><Text style={s.overlayText}>Next: antichess rules, PGN validation, legal-move feedback, and drills.</Text></View>
        </View>
        <Panel><Text style={s.h3}>Planned drill behavior</Text><Text style={s.sub}>Play your moves. The opponent replies from the authored line. Wrong legal moves trigger feedback and a retry. Progress saves on-device.</Text></Panel>
      </>}
      {screen === 'membership' && <>
        <Action label="← Back to courses" secondary onPress={() => setScreen('catalog')}/>
        <Heading eyebrow="Antichess Pro" title="Practice without limits." desc="Subscription screen design preview — billing is not connected."/>
        <Panel><Text style={s.price}>${MONTHLY_USD}<Text style={s.period}> / month</Text></Text><Text style={s.sub}>Full course catalog · offline drills · progress tracking · additional opening repertoires</Text>
          <View style={{marginTop: 20}}><Action label="Subscription setup pending" onPress={() => {}} secondary /></View>
          <Text style={[s.subSmall, {marginTop:12}]}>No purchase can be made from this prototype. Before launch: configure Apple and Google products, RevenueCat entitlement, disclosures, and Restore Purchases.</Text>
        </Panel>
      </>}
    </ScrollView>
    <View style={s.nav}><Pressable onPress={() => setScreen('catalog')}><Text style={s.navText}>▦  Courses</Text></Pressable><Pressable onPress={() => setScreen('membership')}><Text style={s.navText}>✦  Membership</Text></Pressable></View>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: {flex:1, backgroundColor:colors.bg}, topbar:{height:58, paddingHorizontal:24, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderBottomColor: colors.border, borderBottomWidth:1},brand:{color:colors.ink,fontWeight:'900',fontSize:18,letterSpacing:2},topLink:{color:colors.accent,fontWeight:'700',fontSize:12},
  content:{padding:22,paddingBottom:44,gap:14},eyebrow:{color:colors.accent,fontSize:11,fontWeight:'800',letterSpacing:1.6},h1:{color:colors.ink,fontSize:34,fontWeight:'850',letterSpacing:-1.1},h2:{color:colors.ink,fontSize:23,fontWeight:'800'},h3:{color:colors.ink,fontSize:17,fontWeight:'750'},sub:{color:colors.muted,fontSize:15,lineHeight:22},subSmall:{color:colors.muted,fontSize:12,lineHeight:18},
  panel:{backgroundColor:colors.card,borderRadius:18,padding:20,gap:11,borderColor:colors.border,borderWidth:1},course:{backgroundColor:colors.card2,borderRadius:18,padding:16,flexDirection:'row',alignItems:'center',gap:14},courseIcon:{height:64,width:64,borderRadius:14,backgroundColor:'#38575c',alignItems:'center',justifyContent:'center'},
  line:{flexDirection:'row',alignItems:'center',gap:14,padding:16,backgroundColor:colors.card,borderRadius:14},circle:{width:38,height:38,borderRadius:19,backgroundColor:'#34535c',alignItems:'center',justifyContent:'center'},circleNumber:{color:colors.ink,fontWeight:'800'},arrow:{color:colors.accent,fontSize:22},
  button:{backgroundColor:colors.accent,paddingVertical:14,paddingHorizontal:20,borderRadius:12,alignItems:'center',marginBottom:8},buttonSecondary:{backgroundColor:colors.card2,borderColor:colors.border,borderWidth:1},buttonLabel:{fontSize:14,fontWeight:'800',color:colors.bg},
  board:{width:'100%',aspectRatio:1,flexDirection:'row',flexWrap:'wrap',position:'relative',borderRadius:12,overflow:'hidden'},square:{width:'12.5%',height:'12.5%'},boardOverlay:{position:'absolute',top:'24%',bottom:'24%',left:'7%',right:'7%',alignItems:'center',justifyContent:'center',backgroundColor:'#11232aef',padding:20,borderRadius:18},overlayTitle:{color:colors.ink,fontSize:21,fontWeight:'800',marginBottom:7},overlayText:{color:colors.muted,textAlign:'center',lineHeight:21},
  price:{color:colors.ink,fontSize:48,fontWeight:'900'},period:{fontSize:18,color:colors.muted,fontWeight:'400'},nav:{height:58,borderTopColor:colors.border,borderTopWidth:1,flexDirection:'row',alignItems:'center',justifyContent:'space-around',backgroundColor:colors.bg},navText:{color:colors.ink,fontWeight:'700',fontSize:13}
});
