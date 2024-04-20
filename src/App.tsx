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

const App = () => {
  const title = 'E프레임마법사';

  const [inputValue, setInputValue] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState([{ user: 'AI', content: [''] }]);
  const [displayResponse, setDisplayResponse] = useState(['']);
  const [completedTyping, setCompletedTyping] = useState(true);
  const [displayTextArray, setDisplayTextArray] = useState<string[]>([]);
  const [showTranslate, setShowTranslate] = useState(false);
  const [selectedTranslate, setSelectedTranslate] = useState("ko");

  // input 값이 변경될 때마다 호출되는 함수
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value); // 입력값을 state에 반영합니다.

  const openTranslate = () => {
    setShowTranslate(!showTranslate); // showTranslate 상태를 토글
  };
  

  const onClick = async () => {
    setQuestion(inputValue);
    setInputValue('');
    setChatHistory([...chatHistory, { user: 'AI', content: [`${title}가 답변중입니다...`] }]);

    // 영문 답변
    const englishResult = await axios.get(`${serverUrl}/test`, {
      params: {
        text: inputValue,
      },
    });
    const englishResData = englishResult.data.data.choices.map((choice: any) => {
      return choice.message.content;
    }).join('\n');

    // 한글 답변
    const koreanRes = (
      await axios.get(`${serverUrl}/translate`, {
        params: {
          text: englishResData,
        },
      })
    ).data;

    /// ''' 있을 때부터 클래스 다음 ''' 나올 때까지
    const koreanData = await koreanRes.data[0].translations.map((choice: any) => {
      const text = choice.text.replaceAll('안녕하세요. ', '');
      return text;
    }).join('\n');

    const splitedEnglishData = englishResData.split("```");

    const resultText = `안녕하세요.\n표준프레임워크센터 AI ${title} 입니다.\n\n${koreanData}\n\n감사합니다.`;
    const splitedText = resultText.split("'''").map((text, index)=>{
      
      const isCode = index%2 == 1;
      if(isCode){
        return splitedEnglishData[index];
      }else{
        return text;
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
          }, 60)
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
    <img className={styles.titleImage} src='small_title.png' alt='타이틀 이미지'></img>
    {/* 큰 페이지 제목 */}
    {/* <h1 className={styles.pageTitle}>{title}</h1> */}

    <div className={styles.containerBox}>
      {/* 나머지 입력 요소들 */}
      <br />
      <br />
      <div className={styles.inputContainer}>
        {/* 메인 */}
        <div className={styles.title}>전자 정부 표준 프레임워크 Search AI</div>
        <div className={styles.article}>
          <div className={styles.questionbox}>
            <div className={styles.icon}>
              <BsQuestionSquareFill size={40} color='orange' className={styles.icon} />
            </div>
            <input
              type='text'
              value={inputValue}
              onChange={handleChange}
              placeholder='여기에 입력하세요.'
              className={styles.inputField}
            />

            <button className={styles.submit} onClick={onClick} disabled={!inputValue || !completedTyping}>
              검색
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
                const predicate = index % 2 === 0;
                const returnTag = <pre className={predicate ? "" : styles.code} key={data + index}>{data.trim()}</pre>;
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
