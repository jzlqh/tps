import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@bfe/lux';
import { ByDialog, ByGrid } from '@bybit-fe/bitd';
import { useStore } from 'by-state';
import Spin from 'common/components/Spin';

import { showConfirmDialog, showRevisionDialog } from '@/components/Dialog';
import CoinImage from '@/components/CoinImage';
import FiatImage from '@/components/FiatImage';
import BanWithdrawTip from '@/components/BanWithdrawTip';
import { useOrderCreateForm, useOtcItemSimple } from '@/hooks/taker.hooks';

import { confirmCreateOrder, createOrder } from '@/services/order.service';
import { TRADE_SIDE, TAKER_SIDE, AMOUNT_INPUT_TYPE } from '@/constants/trade';
import { formatNumber } from '@/utils/format';

import skynet from '@/utils/skynet';

import Advertiser from './Advertiser';
import AmountInput from './AmountInput';
import PaymentSelect from './PaymentSelect';

import './index.less';

const { Row, Col } = ByGrid;

// eslint-disable-next-line max-statements
const OrderCreate = (props) => {
  const [t] = useTranslation();
  const history = useHistory();
  const [submitting, setSubmitting] = useState(false);
  const [showPricePopup, setShowPricePopup] = useState(false);
  const [pricePaymentsParams, setPricePaymentsParams] = useState({
    payments: '',
    curPrice: '',
  });
  const [times, setTimes] = useState('first');
  const {
    onClose,
    advertiser,
    visible,
    onRefresh,
    loading,
    orderCreateParamChange,
  } = props;
  const [state] = useStore();
  const { banWithdrawCurrencyList } = state;
  const { symbols } = state.p2pConfig;
  const receiveInputRef = useRef(null);
  // const amountScale = advertiser?.currencyConfig?.amountScale ?? 2;
  // const quantityScale = advertiser?.tokenConfig?.scale ?? 4;
  const amountScale = advertiser?.symbolInfo?.currency?.scale ?? 2;
  const quantityScale = advertiser?.symbolInfo?.token?.scale ?? 4;
  const fiat = advertiser?.currencyId;
  const token = advertiser?.tokenId;
  const actionType = advertiser?.side;

  const orderAutoCancelMinute = useMemo(() => {
    const symbol = symbols?.find(
      (i) => i.currencyId === fiat && i.tokenId === token,
    );

    return symbol?.orderAutoCancelMinute || 15;
  }, [fiat, token]);

  const {
    flag,
    payValue,
    onPayChange,
    receiveValue,
    onReceiveChange,
    errMsg,
    initOrderCreateForm,
    onAll,
    paymentMethod,
    onPaymentMethodChange,
  } = useOrderCreateForm({
    actionType,
    currencyConfig: advertiser?.symbolInfo?.currency,
    tokenConfig: advertiser?.symbolInfo?.token,
    minAmount: advertiser?.minAmount,
    maxAmount: advertiser?.maxAmount,
    lastQuantity: advertiser?.lastQuantity,
    price: advertiser?.price,
    balance: advertiser?.balance,
    fiat,
    token,
  });
  const [, , fetchSimple] = useOtcItemSimple();
  const canNotSubmit =
    errMsg.amountMsg ||
    errMsg.quantityMsg ||
    !payValue ||
    (actionType === TAKER_SIDE.SELL && !paymentMethod?.id);

  useEffect(() => {
    if (!visible) {
      initOrderCreateForm();
      setSubmitting(false);
    } else {
      receiveInputRef.current?.focus();
      skynet.sensors.track('P2POrderCreateModalView');
    }
  }, [visible]);

  const submitOrder = (curPrice) => {
    return new Promise((resolve, reject) => {
      const params = {
        itemId: advertiser?.id,
        tokenId: token,
        currencyId: fiat,
        side: actionType === TAKER_SIDE.BUY ? TRADE_SIDE.BUY : TRADE_SIDE.SELL,
        quantity: actionType === TAKER_SIDE.SELL ? payValue : receiveValue,
        amount: actionType === TAKER_SIDE.SELL ? receiveValue : payValue,
        curPrice: curPrice ?? advertiser?.curPrice,
        flag,
        // 新版本风控需要，为了兼容老app
        version: '1.0',
      };

      if (actionType === TAKER_SIDE.SELL) {
        params.paymentType = String(paymentMethod.paymentType);
        params.paymentId = paymentMethod.id;
        params.online = paymentMethod.online;
      }
      createOrder(params)
        .then((res) => {
          /* isNeedConfirm = true则需要展示延迟提币tips */
          if (res?.success) {
            handleClose();
            if (res?.isNeedConfirm && actionType === TAKER_SIDE.BUY) {
              showRevisionDialog({
                imgType: 'warn',
                headTitle: t('TRYTips'),
                children: t('otcCreateOrderWithdrawalTips', {
                  hours: 24,
                }),
                needConfirmLoading: true,
                showClose: false,
                showCancel: true,
                onCancel: () => handleClose(),
                onConfirm: async () => {
                  await handleConfirmOrder(res, resolve, reject);
                },
              });
            } else {
              history.push(`/otc/orderList/${res.orderId}`);
            }
          } else {
            resolve();
          }
        })
        .catch((e) => {
          const code = e?.data?.ret_code;
          const msg = e?.data?.ret_msg;
          const result = e?.data?.result;
          if (!code || !msg) {
            reject(e);
            return;
          }
          switch (code) {
            case 41004: // 广告主要求kyc
            case 42034: // 金额超过平台要求金额，需要kyc
              showConfirmDialog({
                head: t('otcOrderCancel'),
                children: t('otcNeedKycErrMsg'),
                confirmText: t('otcIdentifyAndBuy'),
                showCancel: false,
                onConfirm: () => window.open('/user/accounts/auth/personal'),
              });
              break;
            case 42006: // 取消次数超限
              showConfirmDialog({
                head: t('otcNotToday'),
                children: t('otcFrequencyWarning'),
                showCancel: false,
                onConfirm: () => onRefresh?.(),
              });
              break;
            case 32128: // 运营封禁
              showConfirmDialog({
                head: t('otcNotSupport'),
                children: t('otcNotSupportWarning'),
                showCancel: false,
                onConfirm: () => onRefresh?.(),
              });
              break;
            case 41100: // 广告不存在
            case 41101: // 广告余额不足
              showConfirmDialog({
                head: t('otcOrderChange'),
                children: msg,
                confirmText: t('otcOk'),
                showCancel: false,
                onConfirm: () => onRefresh?.(),
              });
              break;
            case 41302: // 需设定商家的支付方式
              showConfirmDialog({
                head: t('otcCreateOrderFailed'),
                children: msg,
                confirmText: t('otcSetting'),
                showCancel: false,
                onConfirm: () => history.push('/otc/profile'),
              });
              break;
            case 42036: {
              // 风控 大额用户异常
              skynet.sensors.track('P2PSusciousUsersModalView');
              showConfirmDialog({
                head: t('otcCreateOrderFailed'),
                children: t('otcRiskWarning'),
                confirmText: t('otcOk'),
                showCancel: false,
                onConfirm: () => {
                  skynet.sensors.track('P2PSusciousUsersModalView', {
                    button_name: 'confirm_btn',
                  });
                  onRefresh?.();
                },
              });
              break;
            }
            case 42028: {
              // 风控 其他异常
              skynet.sensors.track('P2PRestrictedOrderUserModalView');
              showConfirmDialog({
                head: t('otcCreateOrderFailed'),
                children: msg,
                confirmText: t('otcOk'),
                showCancel: false,
                onConfirm: () => {
                  skynet.sensors.track('P2PRestrictedOrderUserModalView', {
                    button_name: 'confirm_btn',
                  });
                  onRefresh?.();
                },
              });
              break;
            }
            case 42038: {
              // 在Taker下单时，Maker风控中标
              showConfirmDialog({
                head: t('otcNotice'),
                children: t('otcReselectAd'),
                confirmText: t('otcOk'),
                showCancel: false,
              });
              break;
            }
            case 42039: {
              // 风控 黑词条异常
              showConfirmDialog({
                head: t('otcNotice'),
                children: t('otcRiskControlWarning'),
                confirmText: t('otcOk'),
                showCancel: false,
                onConfirm: () => onRefresh?.(),
              });
              break;
            }
            case 912110000: {
              // 风控 安全余额不足
              showRevisionDialog({
                imgType: 'error',
                headTitle: t('otcNotice'),
                children: msg,
                confirmText: t('otcOk'),
                showCancel: false,
                onConfirm: () => onRefresh?.(),
              });
              break;
            }
            // 合规墙
            case 10024:
              window.BybitUniFrame.ready(({ complianceWall }) => {
                complianceWall?.showModal(code, result);
              });
              break;
            // 拟态弹窗，跳转申诉页面
            case 912000005:
            case 300900003:
            case 300900004:
            case 300900005:
            case 200110519: {
              const appeal_case = e?.data?.ext_info ?? {};
              const { appealStatus, appealId = '' } = appeal_case;
              if (appealStatus === 'PENDING') {
                showConfirmDialog({
                  head: t('appealRiskWarning'),
                  children: t('appealRiskWarningDialog'),
                  confirmText: t('submitDocuments'),
                  onConfirm: () => {
                    history.push(`/appeal?type=p2p&id=${appealId}`);
                  },
                });
              } else if (appealStatus === 'COMMITTED') {
                showConfirmDialog({
                  head: t('appealRiskWarning'),
                  children: t('appealRiskWarningDialogPending'),
                });
              } else if (appealStatus === 'REJECTED') {
                showConfirmDialog({
                  head: t('appealRiskWarning'),
                  children: t('appealRiskWarningDialogResubmit'),
                  confirmText: t('submitDocuments'),
                  onConfirm: () => {
                    history.push(`/appeal?type=p2p&id=${appealId}`);
                  },
                });
              }
              break;
            }
            default:
              showRevisionDialog({
                headTitle: t('otcCreateOrderFailed'),
                children: msg,
                confirmText: t('otcOk'),
                showCancel: false,
                onConfirm: () => onRefresh?.(),
              });
          }
          handleClose();
          resolve();
        });
    });
  };
  const createOrders = async (curPrice) => {
    setSubmitting(true);
    try {
      await submitOrder(curPrice);
    } finally {
      setSubmitting(false);
    }
  };
  const pricePaymentConditionsFn = (ret, paymentsCondition) => {
    if (advertiser?.price !== ret?.price && paymentsCondition) {
      setPricePaymentsParams((opt) => {
        return {
          ...opt,
          price: ret.price,
          payments: ret.payments,
        };
      });
    }
    if (advertiser?.price !== ret?.price) {
      setPricePaymentsParams((opt) => {
        return {
          ...opt,
          price: ret.price,
        };
      });
    }
    if (paymentsCondition) {
      setPricePaymentsParams((opt) => {
        return {
          ...opt,
          payments: ret.payments,
        };
      });
    }
    initOrderCreateForm();
    setShowPricePopup(true);
  };

  const handleConfirm = async () => {
    if (advertiser?.priceType === 0) {
      if (times === 'second') {
        await createOrders();
      } else {
        const ret = await fetchSimple(advertiser?.id);
        const paymentsCondition =
          advertiser?.payments.length !== ret?.payments.length ||
          advertiser?.payments.filter((t) => !ret?.payments.includes(+t))
            .length;
        if (
          (advertiser?.price !== ret?.price || paymentsCondition) &&
          actionType === TAKER_SIDE.BUY
        ) {
          setTimes('second');
          pricePaymentConditionsFn(ret, paymentsCondition);
        } else if (
          advertiser?.price !== ret?.price &&
          actionType === TAKER_SIDE.SELL
        ) {
          setTimes('second');
          setPricePaymentsParams((opt) => {
            return {
              ...opt,
              price: ret.price,
            };
          });
          setShowPricePopup(true);
          initOrderCreateForm();
        } else {
          createOrders(result?.curPrice ?? null);
        }
      }
    } else {
      await createOrders();
    }
  };

  const handleClose = () => onClose?.();

  const handleConfirmOrder = async (res, resolve, reject) => {
    await confirmCreateOrder({
      confirmId: res.confirmId,
    })
      .then((res) => {
        history.push(`/otc/orderList/${res?.orderId}`);
      })
      .catch((e) => {
        const code = e?.data?.ret_code;
        const msg = e?.data?.ret_msg;
        const result = e?.data?.result;
        if (!code || !msg) {
          reject(e);
          return;
        }
        switch (code) {
          case 912120030: // 风控：912120030 价格失效
            showRevisionDialog({
              imgType: 'error',
              headTitle: t('otcOrderChange'),
              children: msg,
              confirmText: t('otcOk'),
              showCancel: false,
            });
            break;
          case 912110000: // 风控 安全余额不足
            showRevisionDialog({
              imgType: 'error',
              headTitle: t('TRYTips'),
              children: msg,
              confirmText: t('otcOk'),
              showCancel: false,
              onConfirm: () => onRefresh?.(),
            });
            break;
          // 合规墙
          case 10024:
            window.BybitUniframe.ready(({ complianceWall }) => {
              complianceWall?.showModal(code, result);
            });
            break;
          default:
            showRevisionDialog({
              imgType: 'error',
              headTitle: t('otcCreateOrderFailed'),
              children: msg,
              confirmText: t('otcOk'),
              showCancel: false,
              onConfirm: () => onRefresh?.(),
            });
        }
        resolve();
      });
  };
  const showPricePayments = () => {
    let showTips = '';
    if (actionType === TAKER_SIDE.BUY) {
      if (pricePaymentsParams.price && pricePaymentsParams.payments) {
        showTips = 'otcPaymentsPriceHasChangedConfirmContinue';
      } else {
        if (pricePaymentsParams.price) {
          showTips = 'otcPriceHasChangedConfirm';
        }
        if (pricePaymentsParams.payments) {
          showTips = 'otcPaymentsHasChangedConfirmContinue';
        }
      }
    }
    if (actionType === TAKER_SIDE.SELL) {
      showTips = 'otcPriceHasChangedConfirmContinueOrder';
    }

    return times === 'second' ? <p id="order-tip">{t(showTips)}</p> : null;
  };
  const getAmountInputProps = (type) => {
    if (
      (type === AMOUNT_INPUT_TYPE.PAY && actionType === TAKER_SIDE.BUY) ||
      (type === AMOUNT_INPUT_TYPE.RECEIVE && actionType === TAKER_SIDE.SELL)
    ) {
      return {
        icon: fiat ? (
          <FiatImage coin={fiat} className="order-create-modal__coin-image" />
        ) : null,
        currency: fiat,
        scale: amountScale,
        errMsg: errMsg.amountMsg,
        onInputAll: () => onAll?.(type),
      };
    }
    return {
      icon: token ? (
        <CoinImage coin={token} className="order-create-modal__coin-image" />
      ) : null,
      currency: token,
      scale: quantityScale,
      errMsg: errMsg.quantityMsg,
      onInputAll: () => onAll?.(type),
    };
  };
  return (
    <ByDialog
      className="show-darkModal otc__dialog order-create-modal"
      open={visible}
      showFoot={false}
      head={null}
      destroyOnClose
      lockScroll
      draggable={false}
      onOutsideClick={() => {
        handleClose();
        setTimes('first');
        skynet.sensors.track('P2POrderCreateModalViewClick', {
          button_name: 'cancel_btn',
        });
      }}
    >
      <Spin
        spinning={loading}
        iconClassName="fiat-iconfont fiat-icon--loading"
        size={24}
        color="#8E949A"
      >
        <Row
          align="stretch"
          onClick={() => {
            setShowPricePopup(false);
          }}
        >
          <Col span={11}>
            <Advertiser
              advertiser={advertiser}
              orderCreateParamChange={orderCreateParamChange}
              pricePaymentsParams={pricePaymentsParams}
            />
          </Col>
          <Col span={13}>
            <div className="order-create-modal__form-wrapper">
              <AmountInput
                forwardRef={receiveInputRef}
                label={
                  actionType === TAKER_SIDE.SELL
                    ? t('otcP2pSell')
                    : t('otcP2pPay')
                }
                value={payValue}
                onChange={(v) => {
                  onPayChange(v, pricePaymentsParams?.price);
                }}
                onFocusFn={() => {
                  if (times === 'second') {
                    setShowPricePopup(false);
                  }
                }}
                {...getAmountInputProps(AMOUNT_INPUT_TYPE.PAY)}
              />

              <div className="order-create-modal__transfer-icon">
                <div className="order-create-modal__line" />

                <span className="icon fiat-iconfont fiat-icon--doubledown" />

                {actionType === TAKER_SIDE.BUY &&
                  advertiser?.hasOnlinePayment && (
                    <span className="order-create-modal__balance-wrapper">
                      {`${t('otcBalance')}: ${advertiser?.balance?.available
                        ? formatNumber(
                          advertiser?.balance?.available,
                          amountScale,
                        )
                        : '--'
                        } ${fiat ?? ''}`}
                    </span>
                  )}

                {actionType === TAKER_SIDE.SELL && (
                  <span className="order-create-modal__balance-wrapper">
                    {`${t('otcBalance')}: ${advertiser?.balance?.available
                      ? formatNumber(
                        advertiser?.balance?.available,
                        quantityScale,
                      )
                      : '--'
                      } ${advertiser?.balance?.tokenId ?? ''}`}
                  </span>
                )}
              </div>

              <AmountInput
                label={t('otcP2pReceive')}
                value={receiveValue}
                onChange={(v) => {
                  onReceiveChange(v, pricePaymentsParams?.price);
                }}
                onFocusFn={() => {
                  if (times === 'second') {
                    setShowPricePopup(false);
                  }
                }}
                {...getAmountInputProps(AMOUNT_INPUT_TYPE.RECEIVE)}
              />

              {actionType === TAKER_SIDE.SELL && (
                <>
                  <PaymentSelect
                    payments={advertiser.payments}
                    value={paymentMethod}
                    onChange={onPaymentMethodChange}
                    currency={fiat}
                  />
                  {!!Number(paymentMethod?.online) && (
                    <BanWithdrawTip
                      style={{ marginTop: '8px' }}
                      currency={fiat}
                      banList={banWithdrawCurrencyList}
                    />
                  )}
                </>
              )}

              <div className="order-create-modal__button-wrapper">
                {showPricePopup && showPricePayments()}
                <Button
                  disabled={canNotSubmit}
                  loading={submitting}
                  type="primary"
                  onClick={() => {
                    setTimes('first');
                    handleConfirm();
                    skynet.sensors.track('P2POrderCreateModalViewClick', {
                      button_name: 'confirm_btn',
                    });
                  }}
                >
                  {actionType === TAKER_SIDE.SELL ? t('otcSell') : t('otcBuy')}
                </Button>

                <Button
                  onClick={() => {
                    handleClose();
                    setTimes('first');
                    skynet.sensors.track('P2POrderCreateModalViewClick', {
                      button_name: 'cancel_btn',
                    });
                  }}
                >
                  {t('otcCancel')}
                </Button>
              </div>

              {actionType === TAKER_SIDE.BUY && (
                <div className="order-create-modal__bottom-tip">
                  {t('otcTradeTimeWarningMsg', {
                    minute: orderAutoCancelMinute,
                  })}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Spin>
    </ByDialog>
  );
};

OrderCreate.defaultProps = {
  visible: false,
  onClose: null,
  advertiser: null,
  loading: false,
  onRefresh: null,
  orderCreateParamChange: {},
};

OrderCreate.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  advertiser: PropTypes.object,
  onRefresh: PropTypes.func,
  loading: PropTypes.bool,
  orderCreateParamChange: PropTypes.object,
};

export default OrderCreate;


// git fetch -all
// git rebase upstream/master
// git push -f