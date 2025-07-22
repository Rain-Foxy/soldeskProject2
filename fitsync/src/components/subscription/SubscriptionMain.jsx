import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { PaymentUtil } from '../../utils/PaymentUtil';

const Container = styled.div`
  /* 컨테이너에서 이미 패딩과 배경이 설정되므로 여기서는 제거 */
`;

// 제거: Header, Title, Subtitle (컨테이너로 이동됨)

// 구독 상태 카드
const StatusCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid ${props => 
    props.$isSubscriber ? 'var(--primary-blue)' : 'var(--border-light)'
  };
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 16px;
  background: ${props => 
    props.$isSubscriber ? 'var(--primary-blue)' : 'var(--bg-tertiary)'
  };
  color: ${props => 
    props.$isSubscriber ? 'white' : 'var(--text-secondary)'
  };
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

const StatusIcon = styled.span`
  font-size: 15px;
  margin-right: 8px;
  
  @media (min-width: 375px) {
    font-size: 16px;
  }
  
  @media (min-width: 414px) {
    font-size: 17px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  
  @media (min-width: 375px) {
    font-size: 13px;
  }
  
  @media (min-width: 414px) {
    font-size: 14px;
  }
`;

const InfoValue = styled.span`
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

// 제거: TabContainer, TabButton (컨테이너로 이동됨)

// 플랜 비교 컨테이너
const PlansContainer = styled.div`
  margin-bottom: 24px;
`;

const PlansTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
  
  @media (min-width: 375px) {
    font-size: 19px;
  }
  
  @media (min-width: 414px) {
    font-size: 20px;
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const PlanCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid ${props => 
    props.$isPremium ? 'var(--primary-blue)' : 'var(--border-light)'
  };
  position: relative;
  transition: all 0.2s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  
  ${props => props.$clickable && `
    &:active {
      transform: scale(0.98);
    }
  `}
  
  ${props => props.$isPremium && `
    box-shadow: 0 4px 20px rgba(74, 144, 226, 0.2);
  `}
`;

const PlanBadge = styled.div`
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-blue);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  
  @media (min-width: 375px) {
    font-size: 11px;
  }
  
  @media (min-width: 414px) {
    font-size: 12px;
  }
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const PlanTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 4px;
  
  @media (min-width: 375px) {
    font-size: 17px;
  }
  
  @media (min-width: 414px) {
    font-size: 18px;
  }
`;

const PlanPrice = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${props => props.$isPremium ? 'var(--primary-blue)' : 'var(--text-secondary)'};
  margin-bottom: 8px;
  
  @media (min-width: 375px) {
    font-size: 22px;
  }
  
  @media (min-width: 414px) {
    font-size: 24px;
  }
  
  span {
    font-size: 12px;
    color: var(--text-tertiary);
    
    @media (min-width: 375px) {
      font-size: 13px;
    }
    
    @media (min-width: 414px) {
      font-size: 14px;
    }
  }
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

  const PlanFeature = styled.li`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--text-primary);
    flex-direction: column;
    
    @media (min-width: 375px) {
      font-size: 13px;
    }
    
    @media (min-width: 414px) {
      font-size: 14px;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &::before {
      content: '${props => props.$available ? '' : ''}';
      margin-right: 8px;
      flex-shrink: 0;
      font-size: 12px;
    }
    
    ${props => !props.$available && `
      color: var(--text-tertiary);
      text-decoration: line-through;
    `}
  `;

const ComparisonCTA = styled.div`
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-hover) 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: shine 2s infinite;
  }
  
  @keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const CTATitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
  
  @media (min-width: 375px) {
    font-size: 19px;
  }
  
  @media (min-width: 414px) {
    font-size: 20px;
  }
`;

const CTASubtitle = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
  line-height: 1.4;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

const CTAButton = styled.button`
  background: white;
  color: var(--primary-blue);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;
  
  @media (min-width: 375px) {
    font-size: 15px;
  }
  
  @media (min-width: 414px) {
    font-size: 16px;
  }
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
`;

// 액션 버튼들
const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => 
    props.$columns === 3 ? '1fr 1fr 1fr' : 
    props.$columns === 2 ? '1fr 1fr' : '1fr'
  };
  gap: 12px;
  margin-top: 24px;
`;

const ActionButton = styled.button`
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  min-height: 56px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  @media (min-width: 375px) {
    font-size: 15px;
  }
  
  @media (min-width: 414px) {
    font-size: 16px;
  }
  
  background: ${props => {
    switch(props.$variant) {
      case 'primary':
        return 'var(--primary-blue)';
      case 'success':
        return 'var(--success)';
      case 'secondary':
        return 'var(--bg-tertiary)';
      default:
        return 'var(--bg-secondary)';
    }
  }};
  
  color: ${props => 
    props.$variant === 'secondary' ? 'var(--text-primary)' : 'white'
  };
  
  border: ${props => 
    props.$variant === 'secondary' ? '1px solid var(--border-light)' : 'none'
  };
  
  &:hover {
    ${props => props.$variant === 'secondary' ? `
      background: var(--border-light);
      color: var(--primary-blue);
      border-color: var(--primary-blue);
      transform: translateY(-1px);
    ` : `
      filter: brightness(1.1);
      transform: translateY(-1px);
    `}
  }
  
  &:active {
    transform: translateY(0);
  }
    background: ${props => {
      switch(props.$variant) {
        case 'primary':
          return 'var(--primary-blue-hover)';
        case 'success':
          return '#228B22';
        case 'secondary':
          return 'var(--bg-tertiary)';
        default:
          return 'var(--bg-tertiary)';
      }
    }};
  }
  
  &:disabled {
    background: var(--border-medium);
    color: var(--text-tertiary);
    cursor: not-allowed;
    transform: none;
  }
  
  /* 터치 최적화 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`;

// 로딩 스피너
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 에러 메시지
const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--warning);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  
  font-size: 13px;
  color: var(--warning);
  text-align: center;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

// 최근 결제 정보 카드
const RecentPaymentCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid var(--border-light);
`;

const RecentPaymentTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16px;
  
  @media (min-width: 375px) {
    font-size: 17px;
  }
  
  @media (min-width: 414px) {
    font-size: 18px;
  }
`;

const PaymentStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 12px;
  
  @media (min-width: 375px) {
    font-size: 13px;
  }
  
  @media (min-width: 414px) {
    font-size: 14px;
  }
  
  ${props => {
    switch(props.$status) {
      case 'PAID':
        return `
          background: rgba(46, 139, 87, 0.2);
          color: var(--success);
          border: 1px solid var(--success);
        `;
      case 'READY':
        return `
          background: rgba(74, 144, 226, 0.2);
          color: var(--primary-blue);
          border: 1px solid var(--primary-blue);
        `;
      case 'FAILED':
        return `
          background: rgba(244, 67, 54, 0.2);
          color: var(--warning);
          border: 1px solid var(--warning);
        `;
      default:
        return `
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
        `;
    }
  }}
`;

const PaymentInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const PaymentInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PaymentInfoLabel = styled.span`
  font-size: 11px;
  color: var(--text-tertiary);
  
  @media (min-width: 375px) {
    font-size: 12px;
  }
  
  @media (min-width: 414px) {
    font-size: 13px;
  }
`;

const PaymentInfoValue = styled.span`
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
`;

const PaymentActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const PaymentActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  ${props => props.$variant === 'cancel' ? `
    background: rgba(244, 67, 54, 0.1);
    color: var(--warning);
    border: 1px solid var(--warning);
    
    &:hover:not(:disabled) {
      background: rgba(244, 67, 54, 0.2);
    }
  ` : `
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
    
    &:hover:not(:disabled) {
      background: var(--border-light);
      color: var(--text-primary);
    }
  `}
`;

const SubscriptionMain = () => {
  const navigate = useNavigate();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [recentOrder, setRecentOrder] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await PaymentUtil.checkSubscriptionStatus();
      const recnetOrderResult = await PaymentUtil.getRecentHistory();
      
      // 유저 구독 정보
      if (result && result.data) {
        setSubscriptionData(result.data);
      }
      // 유저 최근 거래 정보
      if (recnetOrderResult && recnetOrderResult.data) {
        setRecentOrder(recnetOrderResult.data);
      }

    } catch (err) {
      console.error('구독 상태 조회 오류:', err);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const handleSubscribe = () => {
    // 구독 결제 페이지로 이동하거나 결제수단 선택 모달 열기
    navigate('/subscription/methods?showModal=true&directPay=true');
  };

  const handleManagePayments = () => {
    // 예약 관리 페이지 준비 중 안내
    alert('예약 결제 관리 페이지를 준비 중입니다.');
  };

  const handleManageMethods = () => {
    // 결제수단 관리 페이지로 이동
    navigate('/subscription/methods');
  };

  const handleViewHistory = () => {
    // 결제 내역 페이지로 이동
    navigate('/subscription/history');
  };

  // 예약 결제 취소
  const handleCancelScheduledPayment = async () => {
    if (!recentOrder?.order_idx) return;

    const confirmed = window.confirm(
      '예약된 결제를 취소하시겠습니까?\n\n취소 후 다시 결제를 예약하려면 결제수단 관리에서 새로 등록해주세요.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await PaymentUtil.cancelScheduledPayment(recentOrder.order_idx);
      
      if (response.success) {
        alert('예약 결제가 성공적으로 취소되었습니다.');
        // 구독 정보 새로고침
        await loadSubscriptionData();
      } else {
        alert(`취소 실패: ${response.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('예약 취소 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 결제수단 변경 (구현 예정)
  const handleChangePaymentMethod = () => {
    alert('결제수단 변경 기능을 준비 중입니다.');
  };

  // 결제 상태 텍스트 변환
  const getPaymentStatusText = (status) => {
    switch(status) {
      case 'PAID': return '결제 완료';
      case 'READY': return '결제 예약';
      case 'FAILED': return '결제 실패';
      default: return status || '알 수 없음';
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          {error}
        </ErrorMessage>
        
        <ActionButton 
          $variant="primary" 
          onClick={loadSubscriptionData}
          style={{width: '100%', marginTop: '16px'}}
        >
          다시 시도
        </ActionButton>
      </Container>
    );
  }

  const isSubscriber = subscriptionData?.isSubscriber;
  const daysLeft = subscriptionData?.subscriptionDaysLeft;

  return (
    <Container>
      {/* 구독자만 구독 상태 카드 표시 */}
      {isSubscriber && (
        <StatusCard $isSubscriber={isSubscriber}>
          <StatusBadge $isSubscriber={isSubscriber}>
            <StatusIcon>✅</StatusIcon>
            프리미엄 구독 중&nbsp;&nbsp;
            {recentOrder.order_status === 'PAID' ? daysLeft > 0 ? `D-${daysLeft}` : daysLeft === 0 ? 'D-Day' : '만료됨' : ''}
          </StatusBadge>


          {subscriptionData.nextPaymentDate && (
            <InfoRow>
              <InfoLabel>다음 결제일</InfoLabel>
              <InfoValue>{formatDate(subscriptionData.nextPaymentDate)}</InfoValue>
            </InfoRow>
          )}

          {/* 최근 결제 정보 (구독자) */}
          {recentOrder && Object.keys(recentOrder).length > 0 && (
            <>
              <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <InfoLabel style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    최근 결제
                  </InfoLabel>
                  <PaymentStatusBadge $status={recentOrder.order_status}>
                    {getPaymentStatusText(recentOrder.order_status)}
                  </PaymentStatusBadge>
                </div>
                
                <InfoRow>
                  <InfoLabel>
                    {recentOrder.order_status === 'READY' ? '예약일' : '결제일'}
                  </InfoLabel>
                  <InfoValue>
                    {recentOrder.order_status === 'READY' ? 
                      formatDate(recentOrder.schedule_date) : 
                      formatDate(recentOrder.order_paydate || recentOrder.order_regdate)
                    }
                  </InfoValue>
                </InfoRow>
                
                <InfoRow>
                  <InfoLabel>금액 / 수단</InfoLabel>
                  <InfoValue>
                    {recentOrder.order_price?.toLocaleString() || '0'}원 / {' '}
                    {recentOrder.order_provider === 'KAKAOPAY' ? '카카오페이' :
                     recentOrder.order_provider === 'TOSSPAYMENTS' ? '토스페이먼츠' :
                     recentOrder.order_provider || '알 수 없음'}
                  </InfoValue>
                </InfoRow>

                {/* 예약 상태인 경우에만 액션 버튼 표시 */}
                {recentOrder.order_status === 'READY' && (
                  <PaymentActionButtons style={{ marginTop: '16px' }}>
                    <PaymentActionButton onClick={handleChangePaymentMethod}>
                      결제수단 변경
                    </PaymentActionButton>
                    <PaymentActionButton 
                      $variant="cancel" 
                      onClick={handleCancelScheduledPayment}
                    >
                      예약 취소
                    </PaymentActionButton>
                  </PaymentActionButtons>
                )}
              </div>
            </>
          )}
        </StatusCard>
      )}

      {/* 비구독자만 보이는 플랜 비교 섹션 */}
      {!isSubscriber && (
        <>
          {/* 비구독자용 최근 결제 정보 (실패한 결제나 취소된 예약이 있는 경우) */}
          {recentOrder && Object.keys(recentOrder).length > 0 && (
            <RecentPaymentCard>
              <RecentPaymentTitle>최근 결제</RecentPaymentTitle>
              
              <PaymentStatusBadge $status={recentOrder.order_status}>
                {getPaymentStatusText(recentOrder.order_status)}
              </PaymentStatusBadge>
              
              <PaymentInfoGrid>
                <PaymentInfoItem>
                  <PaymentInfoLabel>금액 · 수단</PaymentInfoLabel>
                  <PaymentInfoValue>
                    {recentOrder.order_price?.toLocaleString() || '0'}원 · {' '}
                    {recentOrder.order_provider === 'KAKAOPAY' ? '카카오페이' :
                     recentOrder.order_provider === 'TOSSPAYMENTS' ? '토스페이먼츠' :
                     recentOrder.order_provider || '알 수 없음'}
                  </PaymentInfoValue>
                </PaymentInfoItem>
                
                <PaymentInfoItem>
                  <PaymentInfoLabel>
                    {recentOrder.order_status === 'READY' ? '예약일' : '시도일'}
                  </PaymentInfoLabel>
                  <PaymentInfoValue>
                    {recentOrder.order_status === 'READY' ? 
                      formatDate(recentOrder.schedule_date) : 
                      formatDate(recentOrder.order_paydate || recentOrder.order_regdate)
                    }
                  </PaymentInfoValue>
                </PaymentInfoItem>
              </PaymentInfoGrid>

              {/* 예약 상태인 경우에만 액션 버튼 표시 */}
              {recentOrder.order_status === 'READY' && (
                <PaymentActionButtons>
                  <PaymentActionButton onClick={handleChangePaymentMethod}>
                    결제수단 변경
                  </PaymentActionButton>
                  <PaymentActionButton 
                    $variant="cancel" 
                    onClick={handleCancelScheduledPayment}
                  >
                    예약 취소
                  </PaymentActionButton>
                </PaymentActionButtons>
              )}
            </RecentPaymentCard>
          )}

          <PlansContainer>
            <PlansTitle>💪 지금 업그레이드하고 더 많은 혜택을!</PlansTitle>
            
            <PlansGrid>
              {/* 무료 플랜 */}
              <PlanCard $isPremium={false}>
                <PlanHeader>
                  <PlanTitle>기본 플랜</PlanTitle>
                  <PlanPrice>무료</PlanPrice>
                </PlanHeader>
                
                <PlanFeatures>
                  <PlanFeature $available={true}>나만의 루틴 만들기</PlanFeature>
                  <PlanFeature $available={true}>운동 기록 작성</PlanFeature>
                  <PlanFeature $available={true}>트레이너 매칭</PlanFeature>
                  <PlanFeature $available={false}>개인 맞춤 루틴 추천</PlanFeature>
                  <PlanFeature $available={false}>운동 피드백 서비스</PlanFeature>
                </PlanFeatures>
              </PlanCard>

              {/* 프리미엄 플랜 */}
              <PlanCard $isPremium={true} $clickable={true} onClick={handleSubscribe}>
                <PlanBadge>추천!</PlanBadge>
                <PlanHeader>
                  <PlanTitle>프리미엄 플랜</PlanTitle>
                  <PlanPrice $isPremium={true}>
                    3,000원
                    <span>/월</span>
                  </PlanPrice>
                </PlanHeader>
                
                <PlanFeatures>
                  <PlanFeature $available={true}>나만의 루틴 만들기</PlanFeature>
                  <PlanFeature $available={true}>운동 기록 작성</PlanFeature>
                  <PlanFeature $available={true}>트레이너 매칭</PlanFeature>
                  <PlanFeature $available={true}>개인 맞춤 루틴 추천</PlanFeature>
                  <PlanFeature $available={true}>운동 피드백 서비스</PlanFeature>
                </PlanFeatures>
              </PlanCard>
            </PlansGrid>
          </PlansContainer>

          {/* CTA 섹션 */}
          <ComparisonCTA onClick={handleSubscribe}>
            <CTATitle>🚀 지금 바로 시작하세요!</CTATitle>
            <CTASubtitle>
              AI가 분석한 나만의 맞춤 운동으로<br />
              더 효과적인 운동을 경험해보세요
            </CTASubtitle>
            <CTAButton>
              프리미엄으로 업그레이드 ✨
            </CTAButton>
          </ComparisonCTA>
        </>
      )}
    </Container>
  );
};

export default SubscriptionMain;
