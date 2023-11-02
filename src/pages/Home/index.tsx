import { socket } from '@services/socket';
import { colors } from '@styles/colors';
import { HTMLAttributes, useEffect, useState } from 'react';
import { Connection } from 'src/main/server';
import styled from 'styled-components';

const Container = styled.main`
  padding: 0.5rem;
`;

const Ips = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const IpsOfConnection = styled.span`
  font-weight: bold;
  font-family: Roboto;
  font-size: 0.75rem;
`;

const Ip = styled.span`
  background: #121214;
  color: white;
  padding: 0.5rem;
  width: 100%;
  border-radius: 6px;
  font-size: 0.75rem;
`;

const ConnectionsGroup = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: space-between;
  gap: 1rem;
`;

const ConnectionCard = styled.div`
  display: flex;
  flex-direction: column;
  background: #efefef;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 3px 3px 10px #00000050;
`;

const ConnectionCardHeader = styled.span`
  display: flex;
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
  font-weight: bold;
  color: ${({ connected }) =>
    connected ? colors.successDefault : colors.errorDefault};
`;

const ConnectionCardBody = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
`;

const ConnectionPendentTasks = styled.span`
  font-size: 0.75rem;
`;

const ProgressBar = styled.div`
  margin-top: 0.25rem;
  width: 100%;
  background-color: #ccc;
  height: 1.25rem;
  border-radius: 1px;
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

export function HomePage() {
  const [ips, setIps] = useState<string[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    socket.on('ips', (ipsReceived) => {
      setIps(ipsReceived);
    });

    socket.on('connections', (connectionsReceived) => {
      setConnections(connectionsReceived);
    });

    return () => {
      socket.off('ips');
      socket.off('connections');
    };
  }, []);

  return (
    <Container>
      <IpsOfConnection>IPS de conexão</IpsOfConnection>
      <Ips>
        {ips.map((ip) => (
          <Ip key={ip}>{ip}</Ip>
        ))}
      </Ips>

      <ConnectionsGroup>
        {connections.map((connection) => (
          <ConnectionCard key={connection.id}>
            <ConnectionCardHeader>
              <ConnectionCardId>{connection.id}</ConnectionCardId>
              <ConnectionCardStatus
                connected={connection.status === 'connected'}
              >
                {connection.status}
              </ConnectionCardStatus>
            </ConnectionCardHeader>
            <ConnectionCardBody>
              <ConnectionPendentTasks>
                Tasks pendentes {connection.tasks}
              </ConnectionPendentTasks>

              <ProgressBar>
                <FilledBar percentage={connection.currentTaskProgress} />
              </ProgressBar>
            </ConnectionCardBody>
          </ConnectionCard>
        ))}
      </ConnectionsGroup>
    </Container>
  );
}
