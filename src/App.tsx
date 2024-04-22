import styles from './styles.module.scss';
import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { BsQuestionSquareFill } from 'react-icons/bs';
import { BsFillChatLeftTextFill } from 'react-icons/bs';
import axios from 'axios';
import { setDefaultResultOrder } from 'dns';

const serverUrl = "http://13.124.93.106:8080/api";

const CursorSVG = () => {
  return (
    <svg className={styles.cursor} viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='15' cy='15' r='15' />
    </svg>
  );
};

function getTitleText(selectedTranslate: string) {
  const titles: any = {
    ko: "전자 정부 표준 프레임워크 Search AI",
    en: "E-Government Framework Search AI",
    vi: "AI Tìm kiếm Khung Chính phủ Điện tử",
    mn: "Цахим засгийн газрын хайлтын AI хөтөлбөр",
    ne: "ई-सरकार ढाँचा खोजी एआई",
    'ar-sa': "الذكاء الاصطناعي لبحث إطار الحكومة الإلكترونية",
    'es-mx': "IA de búsqueda del marco de gobierno electrónico",
    bg: "AI за търсене в рамките на е-правителство",
    'es-ec': "IA de búsqueda del marco de gobierno electrónico",
    'ar-tn': "الذكاء الاصطناعي لبحث إطار الحكومة الإلكترونية",
    sw: "AI ya Utafutaji wa Mfumo wa Serikali Mtandao"
  };
  return titles[selectedTranslate] || ""; // Fallback to empty string if no match
}
function getSearchText(selectedTranslate: string) {
  // const searchText: any = selectedTranslate == 'ko' ? '검색':'Search';
  const searchText: any = '검색';
  const searchTexts: any = {
    ko: "검색",
    en: "Search",
    vi: "Tìm kiếm",
    mn: "Хайх",
    ne: "खोज्नुहोस्",
    'ar-sa': "بحث",
    'es-mx': "Buscar",
    bg: "Търсене",
    'es-ec': "Buscar",
    'ar-tn': "بحث",
    sw: "Tafuta"
  };
  return searchText || "Search"; // Default to English if no match
}
function getInputText(selectedTranslate: string) {
  const placeholders: any = {
    ko: "여기에 입력하세요.",
    en: "Enter it here.",
    vi: "Nhập vào đây.",
    mn: "Энд оруулна уу.",
    ne: "यहाँ टाइप गर्नुहोस्.",
    'ar-sa': "ادخل هنا.",
    'es-mx': "Ingrese aquí.",
    bg: "Въведете тук.",
    'es-ec': "Ingrese aquí.",
    'ar-tn': "ادخل هنا.",
    sw: "Weka hapa."
  };
  return placeholders[selectedTranslate] || "";
}
function getIsRespondingText(selectedTranslate: string) {
  const isRespondingTexts: any = {
    ko: "가 답변 중입니다...",
    en: "E-Wizard is responding...",
    vi: "Pháp sư đang trả lời...",
    mn: "Шидэт хүн хариулж байна...",
    ne: "जादूगर जवाफ दिँदै गर्दैछ...",
    'ar-sa': "الساحر يجيب...",
    'es-mx': "El mago está respondiendo...",
    bg: "Магьосникът отговаря...",
    'es-ec': "El mago está respondiendo...",
    'ar-tn': "الساحر يجيب...",
    sw: "Mchawi anajibu..."
  };
  return isRespondingTexts[selectedTranslate] || "is responding...";
}
function getLocalizedGreeting(selectedTranslate: string, title: string, data: any) {
  const greetings: any = {
    ko: `안녕하세요.\n표준프레임워크센터 AI ${title}입니다.\n\n${data}\n\n감사합니다.`,
    en: `Hello.\nWelcome to the Standard Framework Center AI ${title}.\n\n${data}\n\nThank you.`,
    vi: `Xin chào.\nChào mừng bạn đến với Trung tâm Khung Chuẩn AI ${title}.\n\n${data}\n\nCảm ơn bạn.`,
    mn: `Сайн байна уу.\nСтандарт Хүрээний Төв AI ${title} тавтай морилно уу.\n\n${data}\n\nБаярлалаа.`,
    ne: `नमस्ते।\nप्रमाणित ढाँचा केन्द्र AI ${title} मा स्वागत छ।\n\n${data}\n\nधन्यवाद।`,
    'ar-sa': `مرحبا.\nمرحباً في مركز الإطار القياسي AI ${title}.\n\n${data}\n\nشكراً لك.`,
    'es-mx': `Hola.\nBienvenido al Centro de Marco Estándar AI ${title}.\n\n${data}\n\nGracias.`,
    bg: `Здравейте.\nДобре дошли в Центъра за стандартни рамки AI ${title}.\n\n${data}\n\nБлагодаря ви.`,
    'es-ec': `Hola.\nBienvenido al Centro de Marco Estándar AI ${title}.\n\n${data}\n\nGracias.`,
    'ar-tn': `مرحبا.\nمرحباً في مركز الإطار القياسي AI ${title}.\n\n${data}\n\nشكراً لك.`,
    sw: `Habari.\nKaribu katika Kituo cha Mfumo Sanifu AI ${title}.\n\n${data}\n\nAsante.`
  };
  return greetings[selectedTranslate] || greetings['en']; // Default to English if no match
}


const App = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState([{ user: 'AI', content: [''] }]);
  const [displayResponse, setDisplayResponse] = useState(['']);
  const [completedTyping, setCompletedTyping] = useState(true);
  const [displayTextArray, setDisplayTextArray] = useState<string[]>([]);
  const [showTranslate, setShowTranslate] = useState(false);
  const [selectedTranslate, setSelectedTranslate] = useState("ko");

  const title = selectedTranslate =='ko' ? 'E프레임마법사' : '';

  // input 값이 변경될 때마다 호출되는 함수
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value); // 입력값을 state에 반영합니다.

  const openTranslate = () => {
    setShowTranslate(!showTranslate); // showTranslate 상태를 토글
  };
  
  const onClick = async () => {
    setQuestion(inputValue);
    setInputValue('');
    setChatHistory([...chatHistory, { user: 'AI', content: [`${title}${getIsRespondingText(selectedTranslate)}`] }]);

    // 영문 답변
    // const englishResult = await axios.get(`${serverUrl}/test`, {
    const englishResult = await axios.get(`${serverUrl}/question`, {
      params: {
        text: inputValue+ ' Please answer this question in English. And please give me some code examples.',
      },
    });
    const englishResData = englishResult.data.data.choices.map((choice: any) => {
      const content = choice.message.content.replaceAll('Hello.', '').replaceAll('Hello,', '').replaceAll("```", "'''").replaceAll("``", "'''").replaceAll('Hello!', ''.trim());
      return content;
    }).join('\n');

    // 한글 답변
    console.log({englishResData, selectedTranslate});
    const koreanRes = (
      await axios.get(`${serverUrl}/translate`, {
        params: {
          text: englishResData,
          language: selectedTranslate
        },
      })
    ).data;
    console.log({koreanRes});
    /// ''' 있을 때부터 클래스 다음 ''' 나올 때까지
    // const data = Array.isArray(await koreanRes?.data) ? await koreanRes?.data[0] : ;
    const koreanData = await koreanRes?.data[0]?.translations.map((choice: any) => {
      const text = choice.text.replaceAll('안녕하세요.', '').replaceAll('안녕하세요,', '').replaceAll('안녕하세요!', '').replaceAll('안녕.', '').trim();
      return text;
    }).join('\n');

    const splitedEnglishData = englishResData.split("'''");
    const resultText = getLocalizedGreeting(selectedTranslate, title, koreanData).replaceAll("''", "'''").replaceAll("```", "'''").replaceAll("``", "'''");
    
    // const delimiter = resultText.includes("'''") ? "'''" : "''";
    const splitedText = resultText.split("'''").map((text: any, index: any)=>{
      const isCode = index%2 == 1;
      if(isCode){
        return splitedEnglishData[index];
      }else{
        return text.replaceAll("'", "").replaceAll("`", "");
      }
    });

    setChatHistory([...chatHistory, { user: 'User', content: splitedText }]);
  };

  useEffect(() => {
    const runTypingAnimation = async () => {
      const originContent = chatHistory[1]?.content;
      if (!originContent) return;

      // 텍스트 생성 애니메이션 시작
      setCompletedTyping(false);

      for(let i = 0; i<originContent.length; ++i) {
        // 각 텍스트 그룹이 생성될 때까지 기다림
        await new Promise((resolve) => {
          let j = 0;
          const intervalId = setInterval(() => {
            const tempString = originContent[i].slice(0, j);
            j++;
            setDisplayResponse((state) => {
              const curState = [...state];
              curState[i] = tempString;
              return curState;
            })
            if(j > originContent[i].length) {
              clearInterval(intervalId);
              resolve(intervalId);
            }
          }, 25)
        })
      }

      // 모든 애니메이션이 끝난 후 상태 업데이트
      setCompletedTyping(true); 
    };
  
    runTypingAnimation();
  }, [chatHistory]); // chatHistory 변경 시에만 useEffect 실행
  

  return (<>
    <div className={styles.header}>
          <div></div>
          <div className={styles.translate} onClick={()=>{
            openTranslate();
          }}>
            
            <img onClick={() => openTranslate()} className={styles.translateImg} src='translate.png' alt='번역'></img>
           {showTranslate ?  <ul className={showTranslate ? styles.open : ""} >
              <li onClick={(e) => {setSelectedTranslate("ko")}}>KO(Korean) - 한국어</li>
              <li onClick={(e) => {setSelectedTranslate("en")}}>EN(English) - 영어</li>
              <li onClick={(e) => {setSelectedTranslate("vi")}}>VI(Vietnamese) - 베트남어</li>
              <li onClick={(e) => {setSelectedTranslate("mn")}}>MN(Mongolian) - 몽골어</li>
              <li onClick={(e) => {setSelectedTranslate("ne")}}>NE(Nepali) - 네팔어</li>
              <li onClick={(e) => {setSelectedTranslate("ar-sa")}}>AR-SA(Arabic) - 사우디아라비아어</li>
              <li onClick={(e) => {setSelectedTranslate("es-mx")}}>ES-MX(Spanish) - 멕시코어</li>
              <li onClick={(e) => {setSelectedTranslate("bg")}}>BG(Bulgarian) - 불가리아어</li>
              <li onClick={(e) => {setSelectedTranslate("es-ec")}}>ES-EC(Spanish) - 에콰도르어</li>
              <li onClick={(e) => {setSelectedTranslate("ar-tn")}}>AR-TN(Arabic) - 튀니지어</li>
              <li onClick={(e) => {setSelectedTranslate("sw")}}>SW(Swahili) - 탄자니아어</li>
            </ul> : <></>}
          <div className={styles.selected}>{selectedTranslate.toUpperCase()}</div>
          </div>
        </div>
    <div className={styles.container}>
    <img className={styles.titleImage} src='small_title.png' alt='타이틀 이미지' onClick={()=>{
      window.location.reload();
    }}></img>
    {/* 큰 페이지 제목 */}
    {/* <h1 className={styles.pageTitle}>{title}</h1> */}

    <div className={styles.containerBox}>
      {/* 나머지 입력 요소들 */}
      <br />
      <br />
      <div className={styles.inputContainer}>
        {/* 메인 */}
        <div className={styles.title}>{getTitleText(selectedTranslate)}</div>
        <div className={styles.article}>
          <div className={styles.questionbox}>
            <div className={styles.icon}>
              <BsQuestionSquareFill size={40} color='orange' className={styles.icon} />
            </div>
            <input
              type='text'
              value={inputValue}
              onChange={handleChange}
              placeholder={getInputText(selectedTranslate)}
              className={styles.inputField}
            />

            <button className={styles.submit} onClick={onClick} disabled={!inputValue || !completedTyping}>
              {getSearchText(selectedTranslate)}
            </button>
          </div>
          <div className={styles.yourQuestionContainer}>
            <div className={styles.icon} />
            <div className={styles.yourQuestion}>{question}</div>
          </div>
          <hr className={styles.line} />
          <div className={styles.answer}>
            <div className={styles.icon}>
              <BsFillChatLeftTextFill size={40} color='green' />
            </div>
            <span className={styles.displayResponse}>
              {/* {displayResponse} */}
              {displayResponse.map((data, index) => {
                const isNotCode = index % 2 === 0;

                // 타이틀 언어 감지
                const pattern = /^(javascript|Javascript|JavaScript|JAVASCRIPT|Python|python|jsp|JSP|Jsp|java|JAVA|Java|xml|XML|Xml|C|c|cpp|CPP|Cpp|ruby|RUBY|Ruby|swift|SWIFT|Swift|go|GO|Go|PHP|php|Php|rust|RUST|Rust|csharp|CSHARP|kotlin|KOTLIN|R|r|SCALA|scala|HASKEL|haskel|bash|BASH|html|HTML|Html|Bash|sql|SQL)\b/i;
                const match = data.match(pattern);
                let titleText = '';
                let contentData = data;
                if (match) {
                  titleText = match[0]; // 매치된 텍스트를 타이틀로 사용
                  contentData = data.substring(match[0].length).trim(); // 나머지 텍스트를 데이터로 사용
                }else{
                  contentData = data.trim();
                }
              

                const returnTag = <div className={isNotCode?"":styles.codeWrap} key={data + index}>
                  {/* {titleText} */}
                  <div className={isNotCode?styles.hidden:styles.codeTitle}>
                    <div></div> {/* {titleText} */}
                    <div className={isNotCode?"":styles.codeTitleRight}>E프레임마법사</div>
                  </div>
                  <pre className={isNotCode ? "" : styles.code}>{contentData}</pre>
                </div>;
                return returnTag;
              })}
              {!completedTyping && <CursorSVG />}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div className={styles.footer}></div>
    </div>
  </>
  );
};

export default App;
