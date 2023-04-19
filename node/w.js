import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useStore } from 'by-state';
import { Space, Radio } from '@bfe/lux';
import { intercept, toThousands } from 'by-helpers';
import { ADVERTISING_VERSION } from '@/constants/trade';
import InputBlock from '@/components/maker/InputBlock';
import CreateInput from '@/components/maker/CreateInput';

import './TransactionSettings.less';

export default function TransactionSettings({ itemPaymentPeriod }) {
  const [t] = useTranslation();

  const [
    {
      maker: { form, adVariable, riskTips },
    },
    dispatch,
    {
      maker: { currentToken, currentCurrency, maxQuantity, currentTradedprice },
    },
  ] = useStore();
  useEffect(() => {
    dispatch({
      type: 'maker/setForm',
      payload: { paymentPeriod: form.paymentPeriod || itemPaymentPeriod?.[0] },
    });
  }, [itemPaymentPeriod]);

  const onChange = (e) => {
    dispatch({
      type: 'maker/setForm',
      payload: { paymentPeriod: e.target.value },
    });
  };

  // 缓存最小值
  const getMinPrice = useMemo(() => {
    const tradePrcie = currentTradedprice * currentToken?.minQuote;
    return tradePrcie > currentCurrency?.minQuote
      ? tradePrcie
      : currentCurrency?.minQuote;
  }, [currentTradedprice, currentCurrency?.minQuote]);
  // 缓存最大值
  const getMaxPrice = useMemo(() => {
    const tradePrcie = currentTradedprice * form.quantity;
    return tradePrcie < currentCurrency?.maxQuote && form.quantity > 0
      ? tradePrcie
      : currentCurrency?.maxQuote ?? 0;
  }, [currentTradedprice, form.quantity, currentCurrency]);
  return (
    <InputBlock title={t('otcDealSetting')}>
      <div className="create-maker__time">
        <span>{t('otcPaymentTimeLimit')}</span>
        <Radio.Group
          onChange={onChange}
          value={String(form.paymentPeriod)}
          className="create-maker__time-num"
        >
          {itemPaymentPeriod?.map((item) => (
            <Radio key={item} value={item}>
              {item}
              {t('otcMinutes')}
            </Radio>
          ))}
        </Radio.Group>
      </div>
      <Space.Compact className="create-maker__price-input">
        <CreateInput
          value={form.quantity}
          disabled={
            adVariable.adVersion === ADVERTISING_VERSION.HISTOTY &&
            adVariable.isEdit
          }
          onChange={(quantity) => {
            dispatch({
              type: 'maker/setForm',
              payload: { quantity },
            });
            dispatch({
              type: 'maker/setRiskTips',
              payload: {
                safetyAmountMessage: '',
              },
            });
          }}
          min={0}
          placeholder={t('otcenter')}
          precision={currentToken.scale}
          title={t('otcQuantity')}
          rightIcon={form.tokenId}
          bottomTip={
            <>
              {t('otcMaximumAmount')}:&nbsp;
              {toThousands(maxQuantity, currentToken.scale)} {form.tokenId}
            </>
          }
          bottomRightTip={
            adVariable.adVersion === ADVERTISING_VERSION.HISTOTY &&
              adVariable.isEdit ? null : (
              <div>
                <span
                  className="create-maker__max"
                  onClick={async () => {
                    dispatch({
                      type: 'maker/setForm',
                      payload: {
                        quantity: +intercept(maxQuantity, currentToken.scale),
                      },
                    });
                  }}
                >
                  {t('otcMaximumAmount')}
                </span>
              </div>
            )
          }
          errText={
            <Choose>
              <When
                condition={
                  !(
                    adVariable.adVersion === ADVERTISING_VERSION.HISTOTY &&
                    adVariable.isEdit
                  ) && form.quantity > maxQuantity
                }
              >
                {t('otcExceedLimit')}
              </When>
              <When condition={riskTips?.safetyAmountMessage}>
                {riskTips?.safetyAmountMessage}
              </When>
              <Otherwise>{null}</Otherwise>
            </Choose>
          }
        />
      </Space.Compact>
      <Space className="create-maker__price-input create-maker__price-limit">
        <CreateInput
          value={form.minAmount}
          precision={currentCurrency.scale}
          onChange={(minAmount) => {
            dispatch({
              type: 'maker/setForm',
              payload: { minAmount },
            });
          }}
          title={t('otcMinimumSingleLimit')}
          rightIcon={form.currencyId}
          min={0}
          placeholder={toThousands(getMinPrice, currentCurrency.scale)}
          bottomRightTip={
            <span
              className="create-maker__max"
              onClick={() => {
                dispatch({
                  type: 'maker/setForm',
                  payload: {
                    minAmount: +intercept(getMinPrice, currentCurrency.scale),
                  },
                });
              }}
            >
              {t('otcMinimum')}
            </span>
          }
          errText={
            form.minAmount < getMinPrice
              ? t('otcMaximumAmountLimit', {
                min: toThousands(getMinPrice, currentCurrency.scale),
                max: toThousands(getMaxPrice, currentCurrency.scale),
              })
              : null
          }
        />
        <CreateInput
          value={form.maxAmount}
          precision={currentCurrency.scale}
          onChange={(maxAmount) => {
            dispatch({
              type: 'maker/setForm',
              payload: { maxAmount },
            });
          }}
          min={0}
          title={t('otcMaximumSingleLimit')}
          rightIcon={form.currencyId}
          placeholder={toThousands(getMaxPrice, currentCurrency.scale)}
          bottomRightTip={
            <span
              className="create-maker__max"
              onClick={() => {
                dispatch({
                  type: 'maker/setForm',
                  payload: {
                    maxAmount: +intercept(getMaxPrice, currentCurrency.scale),
                  },
                });
              }}
            >
              {t('otcMaximumAmount')}
            </span>
          }
          errText={
            form.maxAmount > getMaxPrice
              ? t('otcMaximumAmountLimit', {
                min: toThousands(getMinPrice, currentCurrency.scale),
                max: toThousands(getMaxPrice, currentCurrency.scale),
              })
              : null
          }
        />
      </Space>
    </InputBlock>
  );
}

TransactionSettings.defaultProps = {
  itemPaymentPeriod: [],
};

TransactionSettings.propTypes = {
  itemPaymentPeriod: PropTypes.array,
};
