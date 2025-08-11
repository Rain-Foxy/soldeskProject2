import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ChatApi from '../../utils/ChatApi';
import ChatLoading from '../../components/ChatLoading';
import axios from 'axios';
import { maskEmail } from '../../utils/EmailMasking';

const Container = styled.div`
  padding: 20px;
  height: 100%;
  background-color: var(--bg-primary);
  position: relative;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 2.4rem;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const InquiryButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* admin일 때 숨김 */
  display: ${props => props.$isAdmin ? 'none' : 'block'};
  
  &:hover {
    background: var(--primary-blue-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const RoomList = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 1px solid var(--border-light);
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: var(--bg-tertiary);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 16px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  
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
    font-size: 1.6rem;
  }
`;

const RoomInfo = styled.div`
  flex: 1;
  min-width: 0; /* 텍스트 오버플로우를 위해 필요 */
`;

const RoomNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const RoomName = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnreadBadge = styled.div`
  background: #ff4757;
  color: white;
  border-radius: 50%;
  font-size: 1.1rem;
  font-weight: 600;
  min-width: 22px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: pulse 2s infinite;
  line-height: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;

const LastMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasUnread'
})`
  font-size: 1.3rem;
  color: ${props => props.hasUnread ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-weight: ${props => props.hasUnread ? '500' : '400'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeStamp = styled.div`
  font-size: 1.2rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 1.6rem;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.p`
  font-size: 1.3rem;
  color: var(--text-tertiary);
`;

const FilterInfo = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
`;

// 채팅 메인 화면 컴포넌트 - 채팅방 목록 표시 및 관리자 문의 기능 제공
const ChatMain = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  
  // 상태 관리
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [currentMemberIdx, setCurrentMemberIdx] = useState(null);
  
  // 필터링 관련 상태
  const [memberType, setMemberType] = useState(null);
  const [filteredRoomCount, setFilteredRoomCount] = useState(0);

  // 채팅용 member_idx 조회 함수 - 세션에서 member_idx를 가져와 채팅 기능에 사용
  const getMemberIdxForChat = async () => {
    try {
      const response = await axios.get('/api/chat/member-info', {
        withCredentials: true
      });

      if (response.data.success) {
        const memberIdx = response.data.member_idx;
        setCurrentMemberIdx(memberIdx);
        return memberIdx;
      } else {
        if (response.data.message.includes('로그인')) {
          navigate('/login');
        }
        return null;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      return null;
    }
  };

  // 컴포넌트 마운트시 초기화
  useEffect(() => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!user || !user.isLogin) {
      navigate('/login');
      return;
    }

    // member_idx를 먼저 조회한 후 채팅방 목록 로드
    const initializeChat = async () => {
      const memberIdx = await getMemberIdxForChat();
      if (memberIdx) {
        // 사용자 타입 확인
        const userMemberType = user.member_type;
        setMemberType(userMemberType);
        
        await loadRooms();
      }
    };

    initializeChat();
  }, [user, navigate]);

  // 채팅방 목록 조회
  const loadRooms = async () => {
    try {
      setLoading(true);

      // 백엔드 API 호출 - 메시지 필터링이 적용된 결과 반환
      const roomList = await ChatApi.readRoomList();
      setRooms(roomList);
      setFilteredRoomCount(roomList.length);

      // 각 채팅방의 읽지 않은 메시지 개수 조회
      const unreadData = {};
      const lastMessageData = {};

      for (const room of roomList) {
        try {
          // 읽지 않은 메시지 개수 조회
          const unreadResponse = await ChatApi.unreadCount(room.room_idx);
          unreadData[room.room_idx] = unreadResponse.unreadCount || 0;

          // 마지막 메시지 조회
          const messages = await ChatApi.readMessageList(room.room_idx, 0, 1);
          if (messages.length > 0) {
            lastMessageData[room.room_idx] = messages[messages.length - 1];
          }

        } catch (error) {
          unreadData[room.room_idx] = 0;
        }
      }
      setUnreadCounts(unreadData);
      setLastMessages(lastMessageData);
      
    } catch (error) {
      // 에러 처리
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다.');
        navigate('/login');
      } else {
        // 네트워크 오류나 기타 오류는 빈 배열로 처리
        setRooms([]);
        setFilteredRoomCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // admin 여부 확인 (대소문자 무관)
  const isAdmin = user?.member_type?.toLowerCase() === 'admin';

  // 문의하기 버튼 클릭 핸들러 - 관리자와의 채팅방을 생성하거나 기존 방으로 이동
  const handleInquiryClick = async () => {
    if (inquiryLoading) return;
    
    setInquiryLoading(true);
    
    try {
      const ADMIN_MEMBER_IDX = 141; // 관리자 계정 member_idx
      
      // currentMemberIdx 사용
      if (!currentMemberIdx) {
        alert('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        setInquiryLoading(false);
        return;
      }
      
      // 자기 자신과의 채팅 방지
      if (currentMemberIdx === ADMIN_MEMBER_IDX) {
        alert('관리자는 자기 자신과 채팅할 수 없습니다.');
        setInquiryLoading(false);
        return;
      }
      
      // 현재 사용자가 트레이너인지 일반 사용자인지 확인
      const isCurrentUserTrainer = user.member_type === 'trainer';
      
      let trainer_idx, user_idx, room_name;
      
      if (isCurrentUserTrainer) {
        // 현재 사용자가 트레이너인 경우: 관리자를 trainer로, 트레이너를 user로 설정
        trainer_idx = ADMIN_MEMBER_IDX;
        user_idx = currentMemberIdx;
        room_name = `${user.member_name} 트레이너님의 문의`;
      } else {
        // 현재 사용자가 일반 회원인 경우: 관리자가 trainer, 회원이 user  
        trainer_idx = ADMIN_MEMBER_IDX;
        user_idx = currentMemberIdx;
        room_name = `${user.member_name} 회원님의 문의`;
      }
      
      // 채팅방 생성 또는 기존 방 조회
      const roomResponse = await ChatApi.registerRoom(trainer_idx, user_idx, room_name);
      
      if (roomResponse && roomResponse.room_idx) {
        // 관리자 정보 구성
        const adminInfo = {
          member_idx: ADMIN_MEMBER_IDX,
          member_name: '관리자',
          member_image: 'https://res.cloudinary.com/dhupmoprk/image/upload/v1754017325/admin_ol7kl2.png',
          member_type: 'admin'
        };
        
        // roomData 구성
        const enhancedRoomData = {
          ...roomResponse,
          // 관리자는 항상 trainer 정보에 들어감
          trainer_name: adminInfo.member_name,
          trainer_image: adminInfo.member_image,
          // 현재 사용자는 항상 user 정보에 들어감 (트레이너든 회원이든)
          user_name: user.member_name,
          user_image: user.member_image
        };
        
        // 채팅방으로 이동
        navigate(`/chat/${roomResponse.room_idx}`, {
          state: { 
            roomData: enhancedRoomData,
            adminInfo: adminInfo
          }
        });
        
      } else {
        alert('문의하기 채팅방 생성에 실패했습니다.');
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('문의하기 권한이 없습니다.');
      } else {
        alert('문의하기 채팅방 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setInquiryLoading(false);
    }
  };

  // 시간 포맷팅 함수 - 메시지 전송 시간을 사용자에게 친숙한 형태로 변환
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    // 1시간 이내: "방금 전", "30분 전"
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes < 1) return '방금 전';
      return `${diffInMinutes}분 전`;
    }
    
    // 24시간 이내: "오후 3:25"
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // 7일 이내: "3일 전"
    if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}일 전`;
    }
    
    // 그 이후: "12/25"
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  // 채팅방 표시 이름 생성 함수 - 현재 사용자에 따라 상대방 정보를 적절히 표시
  const getRoomDisplayName = (room) => {
    // currentMemberIdx 상태 사용
    if (!currentMemberIdx) {
      return '로딩 중...';
    }
    
    // 관리자 계정 특별 처리 (admin 타입 대응)
    if (isAdmin) {
      // 관리자가 trainer 위치에 있는 경우 -> user 정보 표시
      if (room.trainer_idx === currentMemberIdx) {
        const otherPersonName = room.user_name || '회원';
        const otherPersonEmail = room.user_email || '';
        
        if (otherPersonEmail) {
          const maskedEmail = maskEmail(otherPersonEmail);
          return `${otherPersonName}(${maskedEmail})`;
        } else {
          return otherPersonName;
        }
      } 
      // 관리자가 user 위치에 있는 경우 -> trainer 정보 표시
      else if (room.user_idx === currentMemberIdx) {
        const otherPersonName = room.trainer_name || '트레이너';
        const otherPersonEmail = room.trainer_email || '';
        
        if (otherPersonEmail) {
          const maskedEmail = maskEmail(otherPersonEmail);
          return `${otherPersonName}(${maskedEmail})`;
        } else {
          return otherPersonName;
        }
      }
      // 관리자가 채팅방에 포함되지 않은 경우 (예상치 못한 상황)
      else {
        return '알 수 없는 채팅방';
      }
    }
    
    // 일반 사용자 (trainer/user) 처리
    let otherPersonName = '';
    let otherPersonEmail = '';
    let isAdminChat = false;
    
    if (room.trainer_idx === currentMemberIdx) {
      // 내가 트레이너인 경우 → 회원 정보 표시
      otherPersonName = room.user_name || '회원';
      otherPersonEmail = room.user_email || '';
      // 관리자 체크 (user가 관리자인 경우)
      isAdminChat = room.user_idx === 141;
    } else {
      // 내가 회원인 경우 → 트레이너 정보 표시  
      otherPersonName = room.trainer_name || '트레이너';
      otherPersonEmail = room.trainer_email || '';
      // 관리자 체크 (trainer가 관리자인 경우)
      isAdminChat = room.trainer_idx === 141;
    }
    
    // 관리자인 경우 특별 제목 (일반 사용자가 볼 때)
    if (isAdminChat) {
      return '관리자 문의';
    }
    
    // 일반 사용자인 경우: 반드시 이름(이메일) 형식으로 표시
    if (otherPersonEmail) {
      const maskedEmail = maskEmail(otherPersonEmail);
      return `${otherPersonName}(${maskedEmail})`;
    } else {
      // 이메일 정보가 없더라도 이름은 표시
      return otherPersonName;
    }
  };

  // 상대방 프로필 이미지 및 이름 가져오기
  const getOtherPersonInfo = (room) => {
    // currentMemberIdx 상태 사용
    if (!currentMemberIdx) {
      return { name: '로딩 중...', image: null };
    }
    
    // 관리자 계정 특별 처리 (admin 타입 대응)
    if (isAdmin) {
      // 관리자가 trainer 위치에 있는 경우 -> user 정보 반환
      if (room.trainer_idx === currentMemberIdx) {
        const otherPersonInfo = {
          name: room.user_name || '회원',
          image: room.user_image
        };
        return otherPersonInfo;
      }
      // 관리자가 user 위치에 있는 경우 -> trainer 정보 반환  
      else if (room.user_idx === currentMemberIdx) {
        const otherPersonInfo = {
          name: room.trainer_name || '트레이너',
          image: room.trainer_image
        };
        return otherPersonInfo;
      }
      // 예상치 못한 경우
      else {
        return { name: '알 수 없음', image: null };
      }
    }
    
    // 일반 사용자 처리
    if (room.trainer_idx === currentMemberIdx) {
      // 내가 트레이너인 경우 → 회원 정보 반환
      const otherPersonInfo = {
        name: room.user_name || '회원',
        image: room.user_image
      };
      return otherPersonInfo;
    } else {
      // 내가 일반 사용자인 경우 → 트레이너 정보 반환
      const otherPersonInfo = {
        name: room.trainer_name || '트레이너',
        image: room.trainer_image
      };
      return otherPersonInfo;
    }
  };

  // 마지막 메시지 미리보기 생성
  const getLastMessagePreview = (room) => {
    const lastMessage = lastMessages[room.room_idx];
    
    if (!lastMessage) {
      return '메시지가 없습니다';
    }
    
    let preview = '';
    
    // 메시지 타입별 미리보기 생성
    if (lastMessage.message_type === 'image') {
      preview = '[이미지]';
    } else {
      preview = lastMessage.message_content || '';
    }
    
    // 긴 메시지는 잘라서 표시
    if (preview.length > 30) {
      preview = preview.substring(0, 30) + '...';
    }
    
    return preview;
  };

  // 아바타 렌더링 - 프로필 이미지 또는 초성
  const renderAvatar = (room) => {
    const otherPerson = getOtherPersonInfo(room);
    
    const hasValidImage = otherPerson.image && 
                         typeof otherPerson.image === 'string' && 
                         otherPerson.image.trim() !== '' &&
                         otherPerson.image.startsWith('http');
    
    if (hasValidImage) {
      // 프로필 이미지가 있는 경우
      return (
        <Avatar>
          <img 
            src={otherPerson.image} 
            alt={`${otherPerson.name} 프로필`}
            onError={(e) => {
              // 이미지 로드 실패 시 기본 아바타로 대체
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('default-avatar');
              e.target.parentElement.textContent = otherPerson.name.charAt(0).toUpperCase();
            }}
          />
        </Avatar>
      );
    } else {
      // 프로필 이미지가 없거나 유효하지 않은 경우 초성 표시
      return (
        <Avatar className="default-avatar">
          {otherPerson.name.charAt(0).toUpperCase()}
        </Avatar>
      );
    }
  };

  // 채팅방 클릭 핸들러
  const handleRoomClick = (room) => {
    navigate(`/chat/${room.room_idx}`, {
      state: { roomData: room }
    });
  };

  // 로딩 중 화면
  if (loading) {
    return (
      <Container>
        <Header>
          <Title>채팅목록</Title>
        </Header>
        <ChatLoading />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>채팅목록</Title>
        <InquiryButton 
          onClick={handleInquiryClick} 
          $isAdmin={isAdmin}
          disabled={inquiryLoading}
        >
          {inquiryLoading ? '연결 중...' : '문의하기'}
        </InquiryButton>
      </Header>

      {rooms.length === 0 ? (
        <RoomList>
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyText>
              진행중인 채팅이 없습니다
            </EmptyText>
            <EmptySubtext>
              메시지를 주고받으면 채팅방이 표시됩니다
            </EmptySubtext>
          </EmptyState>
        </RoomList>
      ) : (
        <RoomList>
          {rooms.map((room) => {
            const unreadCount = unreadCounts[room.room_idx] || 0;
            const lastMessage = lastMessages[room.room_idx];
            
            return (
              <RoomItem
                key={room.room_idx}
                onClick={() => handleRoomClick(room)}
              >
                {/* 상대방 아바타 */}
                {renderAvatar(room)}
                
                {/* 채팅방 정보 */}
                <RoomInfo>
                  <RoomNameContainer>
                    <RoomName>{getRoomDisplayName(room)}</RoomName>
                    {/* 읽지 않은 메시지 배지 */}
                    {unreadCount > 0 && (
                      <UnreadBadge>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </UnreadBadge>
                    )}
                  </RoomNameContainer>
                  <LastMessage hasUnread={unreadCount > 0}>
                    {getLastMessagePreview(room)}
                  </LastMessage>
                </RoomInfo>
                
                {/* 마지막 메시지 시간 */}
                <TimeStamp>
                  {formatTime(lastMessage?.message_senddate || room.room_msgdate)}
                </TimeStamp>
              </RoomItem>
            );
          })}
        </RoomList>
      )}
    </Container>
  );
};

export default ChatMain;