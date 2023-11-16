import { socket } from '@services/socket';
import { useEffect, useState } from 'react';
import { ConnectionReturns } from 'src/main/server';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import styled from 'styled-components';
import { ConnectionCard } from './components/ConnectionCard';

const Page = styled.main`
  padding: 1rem;
  width: 100vw;
`;

const Container = styled.main`
  width: 100%;
  max-width: 890px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  font-family: Cinzel_decorative;
  margin-bottom: 3rem;
`;

const Codes = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const CodesOfConnection = styled.span`
  font-weight: bold;
  font-family: Roboto;
  font-size: 0.75rem;
`;

const Code = styled.span`
  background: #121214;
  color: white;
  padding: 0.5rem;
  width: 100%;
  border-radius: 6px;
  font-size: 0.75rem;
`;

const ConnectionsGroup = styled.div`
  margin-top: 1rem;
  padding-bottom: 16rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: space-between;
  gap: 1rem;
`;

export function HomePage() {
  const [codes, setCodes] = useState<string[]>([]);
  const [connections, setConnections] = useState<ConnectionReturns[]>([]);
  const [animationParent] = useAutoAnimate();

  useEffect(() => {
    socket.on('codes', (codesReceived) => {
      setCodes(codesReceived);
    });

    socket.on('connections', (connectionsReceived) => {
      console.log(connectionsReceived);

      setConnections(connectionsReceived);
    });

    return () => {
      socket.off('codes');
      socket.off('connections');
    };
  }, []);

  return (
    <Page>
      <Container>
        <PageTitle>
          Bem vindo(a) ao <br />
          Smart Sharer
        </PageTitle>
        <CodesOfConnection>Códigos de conexão</CodesOfConnection>
        <Codes>
          {codes.map((code) => (
            <Code key={code}>{code}</Code>
          ))}
        </Codes>

        <ConnectionsGroup ref={animationParent}>
          {connections.map((connection) => (
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </ConnectionsGroup>
      </Container>
    </Page>
  );
}
