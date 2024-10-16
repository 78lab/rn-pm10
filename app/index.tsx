import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import styles from './styles'; // 위에서 변환한 스타일시트

export default function HomeScreen() {
  // const [addr, setAddr] = useState('');
  const [pmData, setPmData] = useState({pmGrade:"-",pmType:'pm10',pmTypeTxt:'미세먼지',addr: '-', msg: '-'});
  const [pmRecent, setPmRecent] = useState({pm10Grade1h:'',pm25Grade1h:'',pm10GradeTxt: '', pm25GradeTxt: '', o3GradeTxt: '',pm10Value: '', pm25Value: '', o3Value: '',dataTime: '', stationName: ''});

  const [msg, setMsg] = useState('');
  const [items, setItems] = useState([]);
  const [forecast, setForecast] = useState({ pm10: [], pm25: [], o3: [], time: '' });

  const [location, setLocation] = useState({lat:-1, lon:-1});
  const [airQuality, setAirQuality] = useState(null);
  const [errorMsg, setErrorMsg] = useState("null");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      console.log(currentLocation.coords);
      setLocation({lat:currentLocation.coords.latitude, lon:currentLocation.coords.longitude});

      // API 호출
      fetchAirQualityData(currentLocation.coords.latitude, currentLocation.coords.longitude);
    })();
  }, []);

  const getImageSource = (grade:string) => {
    switch (grade) {
      case '1':
        return require('@/assets/images/grade1.png');
      case '2':
        return require('@/assets/images/grade2.png');
      case '3':
        return require('@/assets/images/grade3.png');
      case '4':
        return require('@/assets/images/grade4.png');
      default:
        return require('@/assets/images/grade.png');
    }
  }

  const fetchAirQualityData = async (lat:number, lon:number) => {
    try {
      const response = await fetch(`https://api.jennyhoney.com/mise?x=${x=lon}&y=${lat}`);
      console.log(response);
      const data = await response.json();
      console.log(data);
      const firstItem = data.items[0]; // 첫 번째 항목을 pmRecent로 설정
      setPmRecent(firstItem);
      setItems(data.items);
      console.log(pmRecent);
      if(pmRecent.pm25Grade1h && pmRecent.pm10Grade1h&& pmRecent.pm25Grade1h > pmRecent.pm10Grade1h){
        // this.pmGrade = this.pmRecent.pm25Grade1h;
        // this.pmType = 'pm25';
        // this.pmTypeTxt = '초미세먼지';
       setPmData({pmGrade:pmRecent.pm25Grade1h,pmType:'pm25',pmTypeTxt:'초미세먼지',addr:data.addr,msg:data.msg})
      } else {
          // this.pmGrade = this.pmRecent.pm10Grade1h;
          // this.pmType = 'pm10';
          // this.pmTypeTxt = '미세먼지';
          setPmData({pmGrade:pmRecent.pm10Grade1h,pmType:'pm10',pmTypeTxt:'미세먼지',addr:data.addr,msg:data.msg})
      }
      console.log(pmData);
      // setAirQuality(data);
      return data;
      // 오프라인 캐시에 저장
      // await cacheAirQualityData(firstItem);
    } catch (error) {
      console.error(error);
    }
  };

  const reload = async () => {
    setLoading(true);
    const data = await fetchAirQualityData(location.lat, location.lon);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', backgroundColor: 'grey' }}>
      <Text style={styles.pmValTxt}>📍 {pmData.addr}</Text>
      <Text>📍 ({pmData.pmGrade}) {pmData.msg}</Text>

      {msg && <Text style={{ margin: 10 }}>{msg}</Text>}

      <View style={{ height: 155 }}>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Image source={getImageSource(pmData.pmGrade)} style={styles.gradeimg} />
      )}
       
        {/* {pmData.pmGrade ? (
          <Image source={require(`@/assets/images/grade${pmData.pmGrade}.png`)} style={styles.gradeimg} />
        ) : null} */}
      </View>

      {pmData.pmType === 'pm10' ? (
        <>
          <Text>미세먼지 {pmRecent.pm10GradeTxt}</Text>
          <Text style={styles.pmValTxt}>{pmRecent.pm10Value}</Text>
        </>
      ) : (
        <>
          <Text>초미세먼지 {pmRecent.pm25GradeTxt}</Text>
          <Text style={styles.pmValTxt}>{pmRecent.pm25Value}</Text>
        </>
      )}

      <Button
        title="공유하기"
        onPress={() => {}} // 공유 로직은 나중에 정의
      />
      <Button title="Reload" onPress={reload} />

      <View style={styles.grid1}>
        <Text>지금 {pmRecent.dataTime} {pmRecent.stationName} 측정소</Text>
      </View>

      {/* 데이터 목록 렌더링 */}
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text>{item.stationName} {item.pm10Grade1h} {item.dataTime}</Text>
        </View>
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  loctime: {
    position: 'absolute',
    top: 30,
    zIndex: 99,
    width: '100%',
    textAlign: 'center',
    color: 'white',
  },
  gradeimg: {
    width: 155,
    height: 155,
  },
  goToForecast: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'rgba(192, 191, 191, 0.5)',
  },
  grade: {
    backgroundColor: 'darkgrey',
  },
  grade0: {
    backgroundColor: 'darkgrey',
  },
  grade1: {
    backgroundColor: 'blue',
  },
  grade2: {
    backgroundColor: 'green',
  },
  grade3: {
    backgroundColor: 'rgb(214, 105, 3)',
  },
  grade4: {
    backgroundColor: 'red',
  },
  c1: {
    color: 'blue',
  },
  c2: {
    color: 'green',
  },
  c3: {
    color: 'rgb(214, 105, 3)',
  },
  c4: {
    color: 'red',
  },
  pmValTxt: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  ss: {
    fontSize: 12,
    fontWeight: '400',
    color: 'darkgray',
  },
  bb: {
    fontWeight: 'bold',
  },
  row: {
    marginTop: 1,
    paddingLeft: 5,
  },
  gridheader: {
    color: 'rgb(114, 114, 114)',
    borderBottomWidth: 1,
    borderColor: 'darkblue',
  },
  grid1: {
    color: 'rgb(58, 58, 58)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    fontSize: 16,
    paddingTop: 4,
    paddingBottom: 5,
  },
  head1: {
    marginTop: 5,
    padding: 5,
    paddingLeft: 8,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  grid2: {
    padding: 0,
  },
  grade1logo: {
    // backgroundImage: 'url(/assets/images/grade1.svg)',
    // backgroundSize: 'contain',
    width: 256,
    height: 256,
  },
});
// export default styles;


// import { Text, View } from "react-native";

// export default function Index() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text>Edit app/index.tsx to edit this screen!!!.</Text>
//     </View>
//   );
// }
