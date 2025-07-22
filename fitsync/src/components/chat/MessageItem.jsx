import React, { useCallback, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import ImageModal from './ImageModal';

// 스피너 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 펄스 애니메이션
const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

// 메시지 컨테이너 - 프로필과 메시지 영역을 분리
const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
  align-items: flex-start; /* flex-end → flex-start로 변경 */
  /* 검색 결과 하이라이트를 위한 transition 추가 */
  transition: background-color 0.3s ease;
  padding: 4px 8px;
  border-radius: 8px;
  gap: 8px; /* 프로필 이미지와 메시지 사이 간격 */
`;

// 프로필 이미지 컴포넌트 - 상단 정렬로 변경
const ProfileImage = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 0; /* margin-bottom 제거하고 margin-top으로 변경 */
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &.default-avatar {
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.4rem;
  }
  
  &.invisible {
    opacity: 0; /* 연속 메시지에서는 보이지 않지만 공간은 유지 */
  }
`;

// 메시지 그룹 (이름 + 말풍선)
const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 70%;
  min-width: 0; /* flexbox에서 축소 허용 */
  word-wrap: break-word; /* 추가 안전장치 */
  align-items: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'}; /* 메시지 정렬 추가 */
`;

// 사용자 이름 표시 (상대방 메시지에만)
const SenderName = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  margin-left: 4px;
  order: 1; /* 이름이 먼저 나오도록 order 설정 */
`;

// 메시지 말풍선 - 텍스트 오버플로우 방지 추가
const MessageBubble = styled.div`
  padding: 10px 14px;
  border-radius: 18px;
  background-color: ${props => props.$isCurrentUser ? 'var(--primary-blue)' : 'var(--bg-secondary)'};
  color: ${props => props.$isCurrentUser ? 'var(--text-primary)' : 'var(--text-primary)'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  border: ${props => props.$isCurrentUser ? 'none' : '1px solid var(--border-light)'};
  max-width: 100%; /* 부모 컨테이너 너비 제한 */
  min-width: 0; /* flexbox에서 축소 허용 */
  overflow: hidden; /* 내용이 넘치지 않도록 */
  order: 2; /* 메시지가 이름 다음에 나오도록 order 설정 */
`;

// 텍스트 오버플로우 방지를 위한 스타일 대폭 강화
const MessageText = styled.div`
  line-height: 1.4;
  white-space: pre-wrap; /* 줄바꿈 보존 */
  font-size: 1.4rem;
  color: inherit; /* 부모 색상 상속 */
  word-wrap: break-word; /* 긴 단어 강제 줄바꿈 */
  word-break: break-word; /* 모든 문자에서 줄바꿈 허용 */
  overflow-wrap: break-word; /* 추가 안전장치 */
  max-width: 100%; /* 부모 컨테이너 초과 방지 */
  hyphens: auto; /* 하이픈 자동 삽입 */
`;

// shouldForwardProp으로 progress prop 전달 방지
const ImageLoadingContainer = styled.div`
  max-width: 200px;
  max-height: 200px;
  min-width: 150px;
  min-height: 100px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border: 2px dashed #ccc;
  position: relative;
  overflow: hidden;
`;

// 로딩 스피너
const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-blue);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 8px;
`;

// 로딩 텍스트
const LoadingText = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  animation: ${pulse} 1.5s ease-in-out infinite;
  font-weight: 500;
`;

// shouldForwardProp으로 progress prop 전달 방지
const LoadingProgress = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== '$progress'
})`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: var(--primary-blue);
  border-radius: 0 0 8px 8px;
  transition: width 0.3s ease;
  width: ${props => props.$progress || 0}%;
`;

// 이미지 로딩 완료 시 스크롤 트리거를 위한 콜백 추가
const MessageImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  display: block;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: scale(1.02); /* 호버 시 살짝 확대 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.98); /* 클릭 시 살짝 축소 */
  }
`;

// 이미지 컨테이너 (이미지와 텍스트를 그룹핑)
const ImageContainer = styled.div`
  /* 이미지가 있을 때 컨테이너 스타일 */
`;

// 시간/읽음 상태 위치
const MessageWithInfo = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  ${props => props.$isCurrentUser ? 'flex-direction: row;' : 'flex-direction: row-reverse;'}
  order: 2;
`;

// 메시지 하단 정보 (시간, 읽음 상태)
const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  font-size: 1.1rem;
  opacity: 0.7;
  gap: 2px;
  white-space: nowrap; /* 시간이 줄바꿈되지 않도록 */
  min-width: fit-content; /* 최소 너비 보장 */
  flex-shrink: 0; /* 축소되지 않도록 */
  margin-top: 0; /* margin-top 제거하고 다시 margin-bottom으로 복원 */
`;

const MessageTime = styled.span`
  color: var(--text-secondary);
  font-size: 1rem;
`;

// 읽음 상태를 시간 아래에 표시
const ReadStatus = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ReadTime = styled.span`
  font-size: 0.8rem;
  color: var(--text-tertiary);
`;

// 프로필 이미지, 시간 표시 여부 props 추가
const MessageItem = ({ 
  message, 
  isCurrentUser, 
  attachments = null, 
  senderName = null,
  senderImage = null, // 프로필 이미지 추가
  showTime = true, // 시간 표시 여부 추가
  onImageLoad = null // 이미지 로딩 완료 콜백 추가
}) => {

  // 이미지 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 이미지 로딩 상태
  const [imageLoading, setImageLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // 이미지 클릭 핸들러 - 새창 대신 모달 열기
  const handleImageClick = useCallback((e) => {
    e.preventDefault(); // 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    
    console.log('🖼️ 이미지 클릭 - 모달 열기:', attachments?.original_filename);
    setIsModalOpen(true);
  }, [attachments]);

  // 모달 닫기 핸들러
  const handleModalClose = useCallback(() => {
    console.log('❌ 이미지 모달 닫기');
    setIsModalOpen(false);
  }, []);

  // 이미지 로드 완료 핸들러
  const handleImageLoad = useCallback(() => {
    console.log('✅ 이미지 로드 완료');
    setImageLoading(false);
    setLoadingProgress(100);
    
    // 부모 컴포넌트에 이미지 로딩 완료 알림 (스크롤 재조정용)
    if (onImageLoad) {
      setTimeout(() => {
        onImageLoad(message.message_idx);
      }, 100); // DOM 업데이트 후 콜백 실행
    }
  }, [onImageLoad, message.message_idx]);

  // 이미지 로드 에러 핸들러
  const handleImageError = useCallback(() => {
    console.log('❌ 이미지 로드 실패');
    setImageLoading(false);
    setLoadingProgress(0);
  }, []);

  // 로딩 진행률 시뮬레이션
  useEffect(() => {
    if (message.message_type === 'image' && !attachments && imageLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [message.message_type, attachments, imageLoading]);

  // 첨부파일이 로드되면 로딩 상태 해제
  useEffect(() => {
    if (attachments && message.message_type === 'image') {
      setImageLoading(false);
      setLoadingProgress(100);
    }
  }, [attachments, message.message_type]);
  
  // 시간을 HH:MM 형식으로 포맷
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 프로필 이미지 렌더링 (연속 메시지 처리 개선)
  const renderProfileImage = () => {
    // 내 메시지는 프로필 이미지 표시하지 않음
    if (isCurrentUser) return null;
    
    const hasValidImage = senderImage && 
                         typeof senderImage === 'string' && 
                         senderImage.trim() !== '' &&
                         senderImage.startsWith('http');
    
    // senderName이 없으면 (연속 메시지) 투명한 공간만 확보
    if (!senderName) {
      return <ProfileImage className="invisible" />;
    }
    
    return (
      <ProfileImage>
        {hasValidImage ? (
          <img 
            src={senderImage} 
            alt={`${senderName} 프로필`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('default-avatar');
              e.target.parentElement.textContent = senderName?.charAt(0).toUpperCase() || '?';
            }}
          />
        ) : (
          <div className="default-avatar">
            {senderName.charAt(0).toUpperCase()}
          </div>
        )}
      </ProfileImage>
    );
  };

  // 읽음 상태 정보 생성
  const getReadStatusInfo = () => {
    // 상대방 메시지인 경우 읽음 상태 표시하지 않음
    if (!isCurrentUser) return null;
    
    // 읽음 시간이 있으면 읽은시간 + "읽음", 없으면 "읽지 않음" 표시
    if (message.message_readdate) {
      return {
        text: '읽음',
        time: null
      };
    } else {
      return {
        text: '읽지 않음',
        time: null
      };
    }
  };

  const readStatusInfo = getReadStatusInfo();

  return (
    <>
    <MessageContainer id={`message-${message.message_idx}`} $isCurrentUser={isCurrentUser}>
      {/* 상대방 메시지인 경우 프로필 이미지 표시 */}
      {renderProfileImage()}
      
      <MessageGroup $isCurrentUser={isCurrentUser}>
        {/* 상대방 메시지인 경우에만 이름 표시 */}
        {!isCurrentUser && senderName && (
          <SenderName>{senderName}</SenderName>
        )}
        
        {/* 메시지와 시간/읽음상태를 나란히 배치 */}
        <MessageWithInfo $isCurrentUser={isCurrentUser}>
          <MessageBubble $isCurrentUser={isCurrentUser}>
            {/* 이미지 메시지 처리 */}
            {message.message_type === 'image' ? (
              <ImageContainer>
                {/* 이미지 로딩 중이거나 첨부파일이 없는 경우 로딩 표시 */}
                {(!attachments || imageLoading) ? (
                  <ImageLoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>이미지 업로드 중...</LoadingText>
                    <LoadingProgress $progress={loadingProgress} />
                  </ImageLoadingContainer>
                ) : (
                  /* 첨부파일이 로드된 경우 이미지 표시 */
                  <MessageImage
                    src={attachments.cloudinary_url}
                    alt={attachments.original_filename}
                    onClick={handleImageClick}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    title="클릭하면 확대하여 볼 수 있습니다"
                    loading="lazy"
                  />
                )}
                
                {/* 이미지와 함께 텍스트 표시 (기본 '[이미지]' 메시지가 아닌 경우) */}
                {message.message_content && message.message_content !== '[이미지]' && (
                  <MessageText>{message.message_content}</MessageText>
                )}
              </ImageContainer>
            ) : (
              /* 일반 텍스트 메시지 */
              <MessageText>{message.message_content}</MessageText>
            )}
          </MessageBubble>
          
          {/* 시간 표시 (showTime이 true일 때만) */}
          {showTime && (
            <MessageInfo $isCurrentUser={isCurrentUser}>
              <MessageTime>
                {formatTime(message.message_senddate)}
              </MessageTime>
              {/* 읽음 상태 (내가 보낸 메시지인 경우에만 표시) */}
              {readStatusInfo && (
                <ReadStatus>
                  <ReadTime>{readStatusInfo.text}</ReadTime>
                </ReadStatus>
              )}
            </MessageInfo>
          )}
        </MessageWithInfo>
      </MessageGroup>
    </MessageContainer>
    {/* 이미지 모달 - attachments가 있을 때만 렌더링 */}
    {attachments && (
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={attachments.cloudinary_url}
        originalFilename={attachments.original_filename}
        onClose={handleModalClose}
      />
    )}
    </>
  );
};

export default MessageItem;