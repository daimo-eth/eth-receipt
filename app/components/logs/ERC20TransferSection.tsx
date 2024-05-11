'use client';

import { NeueMontreal } from '@/public/fonts';
import { IconLink } from '@/public/icons';
import { useState } from 'react';
import { formatValue } from '../../utils/formatting';
import stablecoinsAddresses from '../../utils/tokens/stablecoins';
import { checkTokenWhitelist } from '../../utils/tokens/tokenWhitelist';
import { AddressProfile, EventLog, Transfer } from '../../utils/types';
import AddressBubble from '../shared/AddressBubble';
import TokenWarning from '../shared/TokenWarning';
import TransferArrow from '../shared/TransferArrow';
import { Wiggle } from '../shared/Wiggle';
import { TextHeader, TextMedium, TextMemo, TextValue } from '../typography';

/**
 * Body for an ERC20 Transfer card.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Transfer} props.transferData - The ERC20 transfer data.
 * @returns {React.ReactElement} An ERC20 Transfer card component.
 */
export default function ERC20TransferSection(
  props: Readonly<{
    transferData: Transfer;
    addressProfileFrom: AddressProfile;
    addressProfileTo: AddressProfile;
    eventLogData: EventLog;
    latestFinalizedBlockNumber: number;
  }>,
) {
  return (
    <>
      <AmountRow transferData={props.transferData} eventLogData={props.eventLogData} />
      <Wiggle />
      <div className='flex flex-col container sm:flex-row'>
        <LabelAddr label='FROM' addrProfile={props.addressProfileFrom} />
        <div className='flex items-center overlay-component'>
          <TransferArrow />
        </div>
        <LabelAddr label='TO' addrProfile={props.addressProfileTo} />
      </div>
    </>
  );
}

function LabelAddr({ label, addrProfile }: { label: 'FROM' | 'TO'; addrProfile: AddressProfile }) {
  const border = label === 'FROM' ? '' : 'border-gray1 border-t sm:border-l sm:border-t-[0px]';
  const style = `w-full overflow-hidden flex flex-col gap-y-2 pl-16 pt-6 pb-12 ${border}`;
  return (
    <div className={style}>
      <TextHeader>{label}</TextHeader>
      <AddressBubble addressProfile={addrProfile} />
    </div>
  );
}

function AmountRow({
  transferData,
  eventLogData,
}: {
  transferData: Transfer;
  eventLogData: EventLog;
}) {
  const { chainId, blockNumber, logIndex } = eventLogData;

  const [copied, setCopied] = useState(false);

  // Copies link to clipboard.
  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
    const link = `https://${window.location.hostname}/l/${chainId}/${blockNumber}/${logIndex}`;
    navigator.clipboard.writeText(link);
  };

  const { memo } = transferData;

  return (
    <div className='w-full px-8 pt-12 pb-8 sm:px-10'>
      <div className='flex flex-row justify-between items-center h-8'>
        <div className='w-16'>&nbsp; {/* placeholder for centering */}</div>
        <AmountToken transferData={transferData} eventLogData={eventLogData} />
        <button
          onClick={copyLink}
          className={'flex justify-center w-16 p-4 ' + (copied ? '' : ' hover:opacity-80')}
        >
          {copied && <TextMedium>Copied</TextMedium>}
          {!copied && <IconLink />}
        </button>
      </div>
      {memo && (
        <div className='flex flex-row justify-center pt-3'>
          <TextMemo>{memo}</TextMemo>
        </div>
      )}
    </div>
  );
}

function AmountToken({
  transferData,
  eventLogData,
}: {
  transferData: Transfer;
  eventLogData: EventLog;
}) {
  const value = formatValue(
    Number(transferData.value) / Number(10 ** Number(transferData.tokenDecimal)),
  );

  const isStablecoin = stablecoinsAddresses.includes(transferData.contractAddress);
  const isWhitelistedToken = checkTokenWhitelist(
    transferData.contractAddress,
    eventLogData.chainId,
  );
  const amountTokenStr = `${isStablecoin ? '$' : ''}${value} ${transferData.tokenSymbol}`;

  return (
    <div className={NeueMontreal.className}>
      <div className='flex flex-row flex-start gap-x-1'>
        <TextValue>{amountTokenStr}</TextValue>
        {!isWhitelistedToken && (
          <div className='flex py-1 px-2'>
            <TokenWarning />
          </div>
        )}
      </div>
    </div>
  );
}
