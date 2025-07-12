import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { calculateAge } from '../../../utils/utilFunc';
import { getMemberTotalData } from '../../../utils/memberUtils';
import { useNavigate } from 'react-router-dom';

// 애니메이션 정의
const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

const bounce = keyframes`
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-8px);
    }
    60% {
        transform: translateY(-4px);
    }
`;

const pulse = keyframes`
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
`;

// 메인 컨테이너 - 전체 화면 사용
const FormContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1000;
    max-width: 750px;
    margin: 0 auto;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
`;

// 상단 헤더 영역
const TopHeader = styled.div`
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(74, 144, 226, 0.3);
    
    @media (max-width: 480px) {
        padding: 1.2rem 1.5rem;
    }
`;

const HeaderTitle = styled.h1`
    font-size: 2.2rem;
    font-weight: 800;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    
    @media (max-width: 480px) {
        font-size: 1.8rem;
        gap: 0.5rem;
    }
`;

const CloseButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 0.8rem;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 48px;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    
    &:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.6);
        transform: scale(1.1) rotate(90deg);
    }
    
    @media (max-width: 480px) {
        font-size: 1.2rem;
        min-width: 44px;
        min-height: 44px;
        padding: 0.6rem;
    }
`;

// 진행 표시기 영역
const ProgressSection = styled.div`
    background: var(--bg-secondary);
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border-light);
    flex-shrink: 0;
    
    @media (max-width: 480px) {
        padding: 1.2rem 1.5rem;
    }
`;

const ProgressTrack = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
    position: relative;
`;

const ProgressStep = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
`;

const ProgressDot = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => 
        props.active ? 'var(--primary-blue)' : 
        props.completed ? 'var(--check-green)' : 'var(--border-medium)'};
    transition: all 0.4s ease;
    flex-shrink: 0;
    border: 3px solid ${props => 
        props.active ? 'var(--primary-blue-light)' : 
        props.completed ? 'var(--success)' : 'var(--border-light)'};
    animation: ${props => props.active ? pulse : 'none'} 2s ease-in-out infinite;
    
    @media (max-width: 480px) {
        width: 14px;
        height: 14px;
        border-width: 2px;
    }
`;

const ProgressLine = styled.div`
    flex: 1;
    height: 3px;
    background: ${props => props.completed ? 'var(--check-green)' : 'var(--border-light)'};
    transition: all 0.4s ease;
    margin: 0 0.5rem;
    border-radius: 2px;
`;

const ProgressInfo = styled.div`
    text-align: center;
    
    h3 {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.3rem 0;
        
        @media (max-width: 480px) {
            font-size: 1.1rem;
        }
    }
    
    p {
        font-size: 1rem;
        color: var(--text-secondary);
        margin: 0;
        
        @media (max-width: 480px) {
            font-size: 0.9rem;
        }
    }
`;

// 메인 콘텐츠 영역 - 남은 공간 모두 사용
const MainContent = styled.div`
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    min-height: 0;
`;

const SlideContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    transform: translateX(${props => props.currentSlide * -100}%);
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const Slide = styled.div`
    min-width: 100%;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    overflow-y: auto;
    animation: ${slideIn} 0.6s ease-out;
    
    /* 커스텀 스크롤바 */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: var(--bg-secondary);
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: var(--primary-blue);
        border-radius: 4px;
    }
    
    @media (max-width: 480px) {
        padding: 1.5rem;
    }
`;

const SlideTitle = styled.h2`
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 1rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-shrink: 0;
    
    @media (max-width: 480px) {
        font-size: 2rem;
        gap: 0.5rem;
        margin-bottom: 0.8rem;
    }
`;

const SlideSubtitle = styled.p`
    font-size: 1.3rem;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 2.5rem;
    line-height: 1.6;
    flex-shrink: 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    
    @media (max-width: 480px) {
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
`;

// 입력 영역
const InputArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 700px;
    margin: 0 auto;
    width: 100%;
    min-height: 0;
    
    @media (max-width: 480px) {
        gap: 1.5rem;
    }
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex-shrink: 0;
`;

const InputLabel = styled.label`
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.8rem;
    
    &::after {
        content: ${props => props.required ? '" *"' : '""'};
        color: var(--warning);
        font-weight: 800;
        font-size: 1.2rem;
    }
    
    @media (max-width: 480px) {
        font-size: 1.2rem;
        gap: 0.6rem;
    }
`;

const InputField = styled.input`
    background: var(--bg-secondary);
    border: 3px solid var(--border-light);
    color: var(--text-primary);
    border-radius: 16px;
    padding: 1.5rem 1.2rem;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    font-weight: 500;
    
    &:focus {
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.15);
        outline: none;
        transform: translateY(-2px);
        background: var(--bg-tertiary);
    }
    
    &::placeholder {
        color: var(--text-tertiary);
        font-size: 1.1rem;
        font-weight: 400;
    }
    
    @media (max-width: 480px) {
        padding: 1.3rem 1rem;
        font-size: 1.1rem;
    }
`;

const SelectField = styled.select`
    background: var(--bg-secondary);
    border: 3px solid var(--border-light);
    color: var(--text-primary);
    border-radius: 16px;
    padding: 1.5rem 1.2rem;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    cursor: pointer;
    font-weight: 500;
    
    &:focus {
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.15);
        outline: none;
        transform: translateY(-2px);
        background: var(--bg-tertiary);
    }
    
    option {
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 1rem;
        font-weight: 500;
    }
    
    @media (max-width: 480px) {
        padding: 1.3rem 1rem;
        font-size: 1.1rem;
    }
`;

// 체크박스 그룹
const CheckboxGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1.2rem;
    
    @media (max-width: 480px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
`;

const CheckboxCard = styled.label`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.2rem;
    background: var(--bg-secondary);
    border: 3px solid var(--border-light);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    font-weight: 600;
    
    &:hover {
        background: var(--bg-tertiary);
        border-color: var(--primary-blue-light);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(74, 144, 226, 0.2);
    }
    
    &:has(input:checked) {
        background: var(--primary-blue-light);
        border-color: var(--primary-blue);
        color: var(--text-primary);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
    }
    
    @media (max-width: 480px) {
        padding: 1rem;
        font-size: 1rem;
        gap: 0.8rem;
    }
`;

const CheckboxInput = styled.input`
    width: 22px;
    height: 22px;
    margin: 0;
    accent-color: var(--primary-blue);
    cursor: pointer;
    
    @media (max-width: 480px) {
        width: 20px;
        height: 20px;
    }
`;

// 하단 네비게이션 영역
const BottomNavigation = styled.div`
    background: var(--bg-secondary);
    padding: 2rem;
    border-top: 1px solid var(--border-light);
    display: flex;
    gap: 1.5rem;
    justify-content: space-between;
    flex-shrink: 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    
    @media (max-width: 480px) {
        padding: 1.5rem;
        gap: 1rem;
    }
`;

const NavButton = styled.button`
    flex: 1;
    padding: 1.5rem 2.5rem;
    font-size: 1.2rem;
    font-weight: 700;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    min-height: 60px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
    
    @media (max-width: 480px) {
        padding: 1.3rem 2rem;
        font-size: 1.1rem;
        min-height: 56px;
        gap: 0.6rem;
    }
`;

const BackButton = styled(NavButton)`
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 3px solid var(--border-medium);
    flex: 0.7;
    
    &:hover:not(:disabled) {
        background: var(--bg-primary);
        border-color: var(--primary-blue);
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
`;

const NextButton = styled(NavButton)`
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
    color: white;
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
    
    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
        animation: ${bounce} 0.6s ease-in-out;
    }
`;

const SubmitButton = styled(NavButton)`
    background: linear-gradient(135deg, var(--check-green), var(--success));
    color: white;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    
    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
        animation: ${bounce} 0.6s ease-in-out;
    }
`;

// Welcome 화면 전용
const WelcomeCenter = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 3rem;
    
    @media (max-width: 480px) {
        gap: 2rem;
    }
`;

const WelcomeIcon = styled.div`
    font-size: 6rem;
    animation: ${pulse} 3s ease-in-out infinite;
    
    @media (max-width: 480px) {
        font-size: 4.5rem;
    }
`;

const WelcomeMessage = styled.div`
    background: linear-gradient(135deg, var(--primary-blue-light), var(--primary-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.8;
    
    @media (max-width: 480px) {
        font-size: 1.3rem;
    }
`;

// 슬라이드 컴포넌트들
const WelcomeSlide = ({ onNext }) => (
    <Slide>
        <SlideTitle>🎯 맞춤형 운동 루틴</SlideTitle>
        <SlideSubtitle>
            AI가 당신만의 특별한 운동 루틴을 만들어드려요!
        </SlideSubtitle>
        
        <WelcomeCenter>
            <WelcomeIcon>🤖💪</WelcomeIcon>
            <WelcomeMessage>
                몇 가지 간단한 정보만 입력하면<br/>
                개인 맞춤형 운동 계획을 받을 수 있어요!
            </WelcomeMessage>
        </WelcomeCenter>
        
        <BottomNavigation>
            <div style={{ flex: 0 }}></div>
            <NextButton onClick={onNext}>
                시작하기 🚀
            </NextButton>
        </BottomNavigation>
    </Slide>
);

const BasicInfoSlide = ({ formData, setFormData, onNext, onBack }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isValid = formData.age && formData.gender && formData.height && formData.weight;

    return (
        <Slide>
            <SlideTitle>👤 기본 정보</SlideTitle>
            <SlideSubtitle>
                정확한 루틴 생성을 위해 기본 정보를 알려주세요
            </SlideSubtitle>
            
            <InputArea>
                <InputGroup>
                    <InputLabel required>🎂 나이</InputLabel>
                    <InputField
                        name="age"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="나이를 입력하세요"
                    />
                </InputGroup>
                
                <InputGroup>
                    <InputLabel required>⚧ 성별</InputLabel>
                    <SelectField
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="">선택하세요</option>
                        <option value="남자">남자</option>
                        <option value="여자">여자</option>
                    </SelectField>
                </InputGroup>
                
                <InputGroup>
                    <InputLabel required>📏 키 (cm)</InputLabel>
                    <InputField
                        name="height"
                        type="number"
                        min="100"
                        max="250"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="키를 입력하세요"
                    />
                </InputGroup>
                
                <InputGroup>
                    <InputLabel required>⚖️ 몸무게 (kg)</InputLabel>
                    <InputField
                        name="weight"
                        type="number"
                        min="30"
                        max="300"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="몸무게를 입력하세요"
                    />
                </InputGroup>
            </InputArea>
            
            <BottomNavigation>
                <BackButton onClick={onBack}>
                    ← 이전
                </BackButton>
                <NextButton onClick={onNext} disabled={!isValid}>
                    다음 →
                </NextButton>
            </BottomNavigation>
        </Slide>
    );
};

const BodyCompositionSlide = ({ formData, setFormData, onNext, onBack }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Slide>
            <SlideTitle>📊 체성분 정보</SlideTitle>
            <SlideSubtitle>
                체성분 정보를 알고 계시면 더 정확한 루틴을 제공할 수 있어요<br/>
                <span style={{ fontSize: '1.1rem', opacity: 0.8, fontWeight: '600' }}>(선택사항)</span>
            </SlideSubtitle>
            
            <InputArea>
                <InputGroup>
                    <InputLabel>🧈 체지방량 (kg)</InputLabel>
                    <InputField
                        name="fat"
                        type="number"
                        min="5"
                        max="300"
                        value={formData.fat}
                        onChange={handleChange}
                        placeholder="체지방량을 입력하세요"
                    />
                </InputGroup>
                
                <InputGroup>
                    <InputLabel>📈 체지방률 (%)</InputLabel>
                    <InputField
                        name="fat_percentage"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.fat_percentage}
                        onChange={handleChange}
                        placeholder="체지방률을 입력하세요"
                    />
                </InputGroup>
                
                <InputGroup>
                    <InputLabel>💪 골격근량 (kg)</InputLabel>
                    <InputField
                        name="skeletal_muscle"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.skeletal_muscle}
                        onChange={handleChange}
                        placeholder="골격근량을 입력하세요"
                    />
                </InputGroup>
            </InputArea>
            
            <BottomNavigation>
                <BackButton onClick={onBack}>
                    ← 이전
                </BackButton>
                <NextButton onClick={onNext}>
                    다음 →
                </NextButton>
            </BottomNavigation>
        </Slide>
    );
};

const HealthConditionSlide = ({ formData, setFormData, onNext, onBack }) => {
    const bodyParts = ['손목', '팔꿈치', '어깨', '목', '허리', '골반', '발목', '무릎'];
    
    const handleCheckboxChange = (bodyPart) => {
        setFormData(prev => ({
            ...prev,
            disease: prev.disease.includes(bodyPart)
                ? prev.disease.filter(item => item !== bodyPart)
                : [...prev.disease, bodyPart]
        }));
    };

    return (
        <Slide>
            <SlideTitle>🏥 건강 상태</SlideTitle>
            <SlideSubtitle>
                불편한 신체 부위가 있다면 알려주세요<br/>
                해당 부위를 피한 안전한 루틴을 만들어드려요
            </SlideSubtitle>
            
            <InputArea>
                <InputGroup>
                    <InputLabel>🩹 불편한 신체 부위</InputLabel>
                    <CheckboxGrid>
                        {bodyParts.map((bodyPart) => (
                            <CheckboxCard key={bodyPart}>
                                <CheckboxInput
                                    type="checkbox"
                                    checked={formData.disease.includes(bodyPart)}
                                    onChange={() => handleCheckboxChange(bodyPart)}
                                />
                                {bodyPart}
                            </CheckboxCard>
                        ))}
                    </CheckboxGrid>
                </InputGroup>
            </InputArea>
            
            <BottomNavigation>
                <BackButton onClick={onBack}>
                    ← 이전
                </BackButton>
                <NextButton onClick={onNext}>
                    다음 →
                </NextButton>
            </BottomNavigation>
        </Slide>
    );
};

const GoalsSlide = ({ formData, setFormData, onNext, onBack, onSubmit }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.age || !formData.gender || !formData.height || !formData.weight) {
            alert('필수 정보를 모두 입력해주세요.');
            return;
        }
        
        const finalFormData = {
            ...formData,
            disease: formData.disease.join(', ')
        };
        
        onSubmit(finalFormData);
    };

    return (
        <Slide>
            <SlideTitle>🎯 운동 목표</SlideTitle>
            <SlideSubtitle>
                어떤 목표로 운동하시나요?<br/>
                목표에 맞는 최적의 루틴을 추천해드려요
            </SlideSubtitle>
            
            <InputArea>
                <InputGroup>
                    <InputLabel>🏃 운동 목적</InputLabel>
                    <SelectField
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                    >
                        <option value="">선택하세요</option>
                        <option value="체중 관리">🔥 체중 관리</option>
                        <option value="근육 증가">💪 근육 증가</option>
                        <option value="체형 교정">📐 체형 교정</option>
                        <option value="체력 증진">⚡ 체력 증진</option>
                        <option value="재활">🏥 재활</option>
                        <option value="바디 프로필">📸 바디 프로필</option>
                    </SelectField>
                </InputGroup>
                
                <InputGroup>
                    <InputLabel>🗓️ 분할 루틴</InputLabel>
                    <SelectField
                        name="split"
                        value={formData.split}
                        onChange={handleChange}
                    >
                        <option value="2">2분할 (주 2회)</option>
                        <option value="3">3분할 (주 3회)</option>
                        <option value="4">4분할 (주 4회)</option>
                        <option value="5">5분할 (주 5회)</option>
                    </SelectField>
                </InputGroup>
            </InputArea>
            
            <BottomNavigation>
                <BackButton onClick={onBack}>
                    ← 이전
                </BackButton>
                <SubmitButton onClick={handleSubmit}>
                    루틴 생성하기 🚀
                </SubmitButton>
            </BottomNavigation>
        </Slide>
    );
};

const SlideInputFormTest = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [memberData, setMemberData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        disease: [],
        purpose: '',
        bmi: '',
        fat: '',
        fat_percentage: '',
        skeletal_muscle: '',
        split: 4,
    });

    // 멤버 데이터 로드
    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const data = await getMemberTotalData();
                setMemberData(data);
                
                if (data) {
                    const { member, body } = data;
                    setFormData(prev => ({
                        ...prev,
                        name: member?.member_name || '',
                        age: member?.member_birth ? calculateAge(member.member_birth) : '',
                        gender: member?.member_gender || '',
                        height: body?.body_height || '',
                        weight: body?.body_weight || '',
                        purpose: member?.member_purpose || '',
                        bmi: body?.body_bmi || '',
                        fat: body?.body_fat || '',
                        fat_percentage: body?.body_fat_percentage || '',
                        skeletal_muscle: body?.body_skeletal_muscle || '',
                        split: member?.member_split || 4,
                    }));
                }
            } catch (error) {
                console.error('멤버 데이터 로드 실패:', error);
            }
        };
        
        fetchMemberData();
    }, []);

    const slides = [
        { component: WelcomeSlide, title: "시작", subtitle: "AI 루틴 생성을 시작해보세요" },
        { component: BasicInfoSlide, title: "기본 정보", subtitle: "나이, 성별, 키, 몸무게를 입력해주세요" },
        { component: BodyCompositionSlide, title: "체성분", subtitle: "체성분 정보로 더 정확한 분석을 해드려요" },
        { component: HealthConditionSlide, title: "건강 상태", subtitle: "불편한 부위를 알려주시면 안전한 루틴을 제공해요" },
        { component: GoalsSlide, title: "운동 목표", subtitle: "목표에 맞는 최적의 루틴을 추천해드려요" }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(current => current + 1);
        }
    };

    const handleBack = () => {
        if (currentSlide > 0) {
            setCurrentSlide(current => current - 1);
        }
    };

    const handleClose = () => {
        navigate('/ai');
    };

    const handleGenerate = (finalFormData) => {
        console.log('생성할 데이터:', finalFormData);
        // 실제 AI 생성 로직으로 이동
        navigate('/ai', { state: { formData: finalFormData } });
    };

    const renderSlide = () => {
        const SlideComponent = slides[currentSlide].component;
        
        const commonProps = {
            formData,
            setFormData,
            onNext: handleNext,
            onBack: handleBack,
            onSubmit: handleGenerate
        };

        return <SlideComponent {...commonProps} />;
    };

    const currentSlideInfo = slides[currentSlide];

    return (
        <FormContainer>
            <TopHeader>
                <HeaderTitle>🤖 AI 루틴 생성</HeaderTitle>
                <CloseButton onClick={handleClose}>✕</CloseButton>
            </TopHeader>
            
            <ProgressSection>
                <ProgressTrack>
                    {slides.map((_, index) => (
                        <ProgressStep key={index}>
                            <ProgressDot 
                                active={index === currentSlide}
                                completed={index < currentSlide}
                            />
                            {index < slides.length - 1 && (
                                <ProgressLine completed={index < currentSlide} />
                            )}
                        </ProgressStep>
                    ))}
                </ProgressTrack>
            </ProgressSection>
            
            <MainContent>
                <SlideContainer currentSlide={0}>
                    {renderSlide()}
                </SlideContainer>
            </MainContent>
        </FormContainer>
    );
};

export default SlideInputFormTest;