import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import MessageItem from './MessageItem';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DateSeparator = styled.div`
  text-align: center;
  margin: 20px 0 10px 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--border-light);
  }
`;

const DateText = styled.span`
  background-color: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 1.2rem;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
  border: 1px solid var(--border-light);
`;

const UnreadSeparator = styled.div`
  text-align: center;
  margin: 16px 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, var(--primary-blue) 20%, var(--primary-blue) 80%, transparent 100%);
  }
`;

const UnreadText = styled.span`
  background-color: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 1.2rem;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
  border: 1px solid var(--border-light);
`;

// MessageList 컴포넌트
const MessageList = ({ 
  messages, 
  currentMemberIdx, 
  attachments, 
  roomData,
  onImageLoad = null,
  onReply = null,
  onDelete = null,
  onReport = null,
  onScrollToMessage = null
}) => {
  
  const [fixedOldestUnreadMessageIdx, setFixedOldestUnreadMessageIdx] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // 초기 로드 완료 여부

  // 초기 읽지 않은 메시지 중 가장 오래된 메시지 ID 계산
  const initialOldestUnreadMessageIdx = useMemo(() => {
    const unreadMessages = messages.filter(msg => 
      msg.sender_idx !== currentMemberIdx && !msg.message_readdate
    );
    
    if (unreadMessages.length === 0) return null;
    
    const oldestUnreadMessage = unreadMessages.reduce((oldest, current) => {
      const oldestTime = new Date(oldest.message_senddate).getTime();
      const currentTime = new Date(current.message_senddate).getTime();
      return currentTime < oldestTime ? current : oldest;
    });
    
    console.log('🔒 초기 가장 오래된 읽지 않은 메시지 ID 고정:', oldestUnreadMessage.message_idx);
    return oldestUnreadMessage.message_idx;
  }, [messages.length, currentMemberIdx]);

  // 초기 로드 시에만 안읽음 구분선 설정
  useEffect(() => {
    if (!initialLoadComplete && messages.length > 0) {
      if (initialOldestUnreadMessageIdx && fixedOldestUnreadMessageIdx === null) {
        setFixedOldestUnreadMessageIdx(initialOldestUnreadMessageIdx);
        console.log('✅ 구분선 위치 고정 (초기 로드):', initialOldestUnreadMessageIdx);
      }
      setInitialLoadComplete(true);
    }
  }, [initialOldestUnreadMessageIdx, fixedOldestUnreadMessageIdx, messages.length, initialLoadComplete]);

  // 답장 대상 메시지 찾기 함수
  const getParentMessage = (parentIdx) => {
    if (!parentIdx) return null;
    return messages.find(msg => msg.message_idx === parentIdx);
  };

  // 답장 미리보기 텍스트 생성
  const getReplyPreviewText = (parentMsg, allAttachments) => {
    if (!parentMsg) return '';
    
    console.log('🎯 MessageList 답장 미리보기 텍스트 생성:', {
      messageType: parentMsg.message_type,
      messageIdx: parentMsg.message_idx,
      messageContent: parentMsg.message_content,
      allAttachments: allAttachments,
      hasAttachments: !!allAttachments,
      attachmentForMessage: allAttachments[parentMsg.message_idx]
    });
    
    if (parentMsg.message_type === 'image') {
      const attachment = allAttachments && allAttachments[parentMsg.message_idx];
      
      console.log('🎯 MessageList 이미지 답장 미리보기 - 첨부파일 검색:', {
        messageIdx: parentMsg.message_idx,
        attachment: attachment,
        hasFilename: !!(attachment && attachment.original_filename),
        originalFilename: attachment?.original_filename
      });
      
      if (attachment && attachment.original_filename) {
        return `📷 ${attachment.original_filename}`;
      }
      
      if (parentMsg.message_content && 
          parentMsg.message_content.trim() !== '' && 
          parentMsg.message_content !== '[이미지]') {
        return parentMsg.message_content;
      }
      
      return '📷 이미지';
    }
    
    return parentMsg.message_content || '';
  };

  // 특정 메시지로 스크롤하는 함수
  const handleScrollToMessage = (messageIdx) => {
    console.log('🎯 MessageList에서 스크롤 요청 받음:', messageIdx);
    
    if (onScrollToMessage) {
      onScrollToMessage(messageIdx);
    } else {
      const messageElement = document.getElementById(`message-${messageIdx}`);
      if (messageElement) {
        messageElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        messageElement.style.backgroundColor = 'rgba(74, 144, 226, 0.2)';
        setTimeout(() => {
          messageElement.style.backgroundColor = '';
        }, 2000);
        
        console.log('✅ 직접 스크롤 완료:', messageIdx);
      } else {
        console.warn('❌ 메시지 요소를 찾을 수 없음:', messageIdx);
      }
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.message_senddate).toDateString();
    const previousDate = new Date(previousMessage.message_senddate).toDateString();
    
    return currentDate !== previousDate;
  };

  // 안읽음 구분선 표시 조건 수정 - 초기 로드 시에만 표시
  const shouldShowUnreadSeparator = (currentMessage) => {
    // 초기 로드가 완료되지 않았거나, 고정된 ID가 없으면 표시하지 않음
    if (!initialLoadComplete || !fixedOldestUnreadMessageIdx) return false;
    
    const shouldShow = currentMessage.message_idx === fixedOldestUnreadMessageIdx;
    
    console.log('📍 읽지 않은 메시지 구분선 체크 (초기 로드 완료 후):', {
      currentMessageIdx: currentMessage.message_idx,
      fixedOldestUnreadMessageIdx: fixedOldestUnreadMessageIdx,
      initialLoadComplete: initialLoadComplete,
      shouldShow: shouldShow
    });
    
    return shouldShow;
  };

  // 연속 메시지 판단 로직
  const isConsecutiveMessage = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;
    
    const currentTime = new Date(currentMessage.message_senddate);
    const previousTime = new Date(previousMessage.message_senddate);
    
    // 같은 발신자인지 확인
    const isSameSender = currentMessage.sender_idx === previousMessage.sender_idx;
    
    // 같은 분(minute) 단위인지 확인
    const currentMinute = currentTime.getFullYear() * 100000000 + 
                         (currentTime.getMonth() + 1) * 1000000 + 
                         currentTime.getDate() * 10000 + 
                         currentTime.getHours() * 100 + 
                         currentTime.getMinutes();
    
    const previousMinute = previousTime.getFullYear() * 100000000 + 
                          (previousTime.getMonth() + 1) * 1000000 + 
                          previousTime.getDate() * 10000 + 
                          previousTime.getHours() * 100 + 
                          previousTime.getMinutes();
    
    const isSameMinute = currentMinute === previousMinute;
    
    const result = isSameSender && isSameMinute;
    
    return result;
  };

  // 그룹의 마지막 메시지 판단 로직
  const isLastInGroup = (currentMessage, nextMessage) => {
    if (!nextMessage) return true;
    
    const currentTime = new Date(currentMessage.message_senddate);
    const nextTime = new Date(nextMessage.message_senddate);
    
    // 다음 메시지가 다른 발신자인지 확인
    const isDifferentSender = currentMessage.sender_idx !== nextMessage.sender_idx;
    
    // 다음 메시지가 다른 분(minute) 단위인지 확인
    const currentMinute = currentTime.getFullYear() * 100000000 + 
                         (currentTime.getMonth() + 1) * 1000000 + 
                         currentTime.getDate() * 10000 + 
                         currentTime.getHours() * 100 + 
                         currentTime.getMinutes();
    
    const nextMinute = nextTime.getFullYear() * 100000000 + 
                      (nextTime.getMonth() + 1) * 1000000 + 
                      nextTime.getDate() * 10000 + 
                      nextTime.getHours() * 100 + 
                      nextTime.getMinutes();
    
    const isDifferentMinute = currentMinute !== nextMinute;
    
    const result = isDifferentSender || isDifferentMinute;
    
    return result;
  };

  const getOtherPersonInfo = (message, isConsecutive) => {
    if (!roomData) return { name: '상대방', image: null };
    
    if (message.sender_idx !== currentMemberIdx) {
      // 연속 메시지인 경우 이름과 이미지를 null로 반환
      if (isConsecutive) {
        return { name: null, image: null };
      }
      
      if (roomData.trainer_idx === currentMemberIdx) {
        return {
          name: roomData.user_name || '회원',
          image: roomData.user_image
        };
      } else {
        return {
          name: roomData.trainer_name || '트레이너',
          image: roomData.trainer_image
        };
      }
    }
    
    return { name: null, image: null };
  };

  const handleImageLoad = (messageIdx) => {
    console.log('📷 MessageList: 이미지 로딩 완료 콜백 수신:', messageIdx);
    if (onImageLoad) {
      onImageLoad(messageIdx);
    }
  };

  return (
    <Container>
      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const nextMessage = messages[index + 1];
        const isConsecutive = isConsecutiveMessage(message, previousMessage);
        const isLastMessage = isLastInGroup(message, nextMessage);
        const otherPersonInfo = getOtherPersonInfo(message, isConsecutive);
        
        // 답장 대상 메시지 찾기
        const parentMessage = getParentMessage(message.parent_idx);

        
        return (
          <React.Fragment key={message.message_idx}>
            {/* 날짜 구분선 */}
            {shouldShowDateSeparator(message, previousMessage) && (
              <DateSeparator>
                <DateText>{formatDate(message.message_senddate)}</DateText>
              </DateSeparator>
            )}
            
            {/* 읽지 않은 메시지 구분선 */}
            {shouldShowUnreadSeparator(message) && (
              <UnreadSeparator>
                <UnreadText>여기서부터 안읽음</UnreadText>
              </UnreadSeparator>
            )}
            
            <MessageItem
              message={message}
              isCurrentUser={message.sender_idx === currentMemberIdx}
              attachments={attachments[message.message_idx] || null}
              senderName={otherPersonInfo.name}
              senderImage={otherPersonInfo.image}
              showTime={isLastMessage}
              isConsecutive={isConsecutive}
              onImageLoad={handleImageLoad}
              onReply={onReply}
              onDelete={onDelete}
              onReport={onReport}
              parentMessage={parentMessage}
              allAttachments={attachments}
              getReplyPreviewText={getReplyPreviewText}
              onScrollToMessage={handleScrollToMessage}
              roomData={roomData}
            />
          </React.Fragment>
        );
      })}
    </Container>
  );
};

export default MessageList;