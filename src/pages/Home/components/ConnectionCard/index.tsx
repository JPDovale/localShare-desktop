import { socket } from '@services/socket';
import { colors } from '@styles/colors';
import { HTMLAttributes, useEffect, useState } from 'react';
import { ConnectionReturns } from 'src/main/server';
import styled from 'styled-components';

const ConnectionCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #f3f3f3;
  border-radius: 10px;
  box-shadow: 3px 3px 16px #00000050;
  overflow: hidden;
`;

interface ConnectionCardDestroyTimerProps
  extends HTMLAttributes<HTMLDivElement> {
  percentage: number;
  inDestroying: boolean;
}

const ConnectionCardDestroyTimer = styled.div<ConnectionCardDestroyTimerProps>`
  display: flex;
  width: ${(props) => props.percentage}%;
  padding: 0.125rem;
  background: ${(props) => (props.inDestroying ? 'red' : 'transparent')};
  margin-bottom: 0.5rem;
  transition: width 1.5s;
`;

const ConnectionCardHeader = styled.span`
  display: flex;
  padding: 0 1rem;
  justify-content: space-between;
  font-size: 0.625rem;
  font-weight: bold;
`;

const ConnectionCardId = styled.span`
  font-weight: bold;
  opacity: 50%;
`;

interface ConnectionCardStatusProps extends HTMLAttributes<HTMLSpanElement> {
  connected: boolean;
}

const ConnectionCardStatus = styled.span<ConnectionCardStatusProps>`
  width: 10px;
  height: 10px;
  padding: 2px;
  border-radius: 50%;
  background-color: ${({ connected }) =>
    connected ? colors.successDefault : colors.errorDefault};
`;

const ConnectionCardBody = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  padding: 0 1rem;
  padding-bottom: 1rem;
`;

const ConnectionPendentTasks = styled.span`
  font-size: 0.625rem;
  opacity: 50%;
  font-weight: bold;
`;

const ProgressBar = styled.div`
  margin-top: 0.25rem;
  width: 100%;
  background-color: #ccc;
  height: 1rem;
  border-radius: 10px;
  overflow: hidden;
`;

interface FilledBarProps extends HTMLAttributes<HTMLDivElement> {
  percentage: number;
}

const FilledBar = styled.div<FilledBarProps>`
  width: ${(props) => props.percentage}%;
  background-color: #0077ff;
  height: 100%;
  transition: width 0.5s;
`;

const CloseConnection = styled.button`
  display: flex;
  justify-content: center;
  background: #ffd1aa;
  border: none;
  cursor: pointer;

  margin-top: 0.5rem;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
  font-weight: bold;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ConnectionCardProps {
  connection: ConnectionReturns;
}

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const [restTime, setRestTime] = useState(30);

  function handleCloseConnection() {
    socket.emit('close-connection', { id: connection.id });
  }

  useEffect(() => {
    if (connection.status === 'disconnected') {
      const destroyIn = setInterval(() => {
        setRestTime((prevRestTime) =>
          prevRestTime > 0 ? prevRestTime - 1 : 0,
        );
      }, 1000);

      return () => clearInterval(destroyIn);
    }

    return () => {};
  }, [connection.status]);

  const restTimePercent = (restTime / 30) * 100;

  return (
    <ConnectionCardContainer key={connection.id}>
      <ConnectionCardDestroyTimer
        inDestroying={connection.status === 'disconnected'}
        percentage={restTimePercent}
      />
      <ConnectionCardHeader>
        <ConnectionCardId>{connection.id}</ConnectionCardId>
        <ConnectionCardStatus connected={connection.status === 'connected'} />
      </ConnectionCardHeader>
      <ConnectionCardBody>
        <ConnectionPendentTasks>
          Tasks pendentes {connection.pendingTasks}
        </ConnectionPendentTasks>

        <ProgressBar>
          <FilledBar percentage={connection.currentTaskProgress} />
        </ProgressBar>

        <CloseConnection
          type="button"
          onClick={() => handleCloseConnection()}
          disabled={connection.status !== 'connected'}
        >
          Fechar conexão
        </CloseConnection>
      </ConnectionCardBody>
    </ConnectionCardContainer>
  );
}
