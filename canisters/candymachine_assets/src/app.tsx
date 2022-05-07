import * as React from "react";
import {Button, Card, Col, Container, Modal, Row, Spinner} from "react-bootstrap";
import PlugConnect from '@psychedelic/plug-connect';
import {canisterId as nftCanister} from "../../declarations/candymachine_dip721";
import {canisterId as candyMachineCanister, idlFactory} from "../../declarations/candymachine";
import {atom, useRecoilState} from "recoil";
import {useEffect} from "react";
import {leftToMint, maxTokens} from "./candymachine";
import {canisters, connectedAtom, leftToMintAtom, loadingAtom, maxTokensAtom} from "./atoms";
import {_SERVICE} from "../../declarations/candymachine/candymachine.did";

const App: React.FC = () => {

    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [maxTokensVar, setMaxTokensVar] = useRecoilState(maxTokensAtom);
    const [leftToMintVar, setLeftOverTokensVar] = useRecoilState(leftToMintAtom);
    const [canister, setCanister] = useRecoilState(canisters);
    const isDevelopment = process.env.NODE_ENV !== "production";
    const host = isDevelopment ? "http://127.0.0.1:8000/" : undefined;
    if (isDevelopment) console.log("started in dev")

    useEffect(() => {
        setCanister([nftCanister, candyMachineCanister]);
        checkConnected().then();
        maxTokens().then((resp) => {
            if(resp.Ok) {
                setMaxTokensVar(Number(resp.Ok))
            }
            console.log(resp);
        });
        leftToMint().then((resp) => {
           if (resp.Ok) {
               setLeftOverTokensVar(Number(resp.Ok));
           }
            console.log(resp);
        });
    }, []);

    async function checkConnected() {
        if (!connected) {
            const result = await (window as any).ic.plug.isConnected();
            if (result) {
                setConnected(true);
            }
        }
    }

    async function mint() {
        // Initialise Agent, expects no return value
        setLoading(true);
        await (window as any)?.ic?.plug?.requestConnect({
            whitelist: canister,
            host: host
        });

        const NNSUiActor: _SERVICE = await (window as any).ic.plug.createActor({
            canisterId: candyMachineCanister,
            interfaceFactory: idlFactory,
        });
        const resp = await NNSUiActor.mint("");
        console.log(resp);
        leftToMint().then((resp) => {
            console.log(resp);
            if (resp.Ok) {
                setLeftOverTokensVar(Number(resp.Ok));
                setLoading(false);
            } else {
                console.error(resp.Err)
            }
        });

    }


    return (
        <div className={"d-flex justify-content-center margin-top minter-dialog"}>
            <Modal
                show={loading}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Minting
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Modal.Body>
            </Modal>
            <Card style={{ width: '28rem' }}>
                <Card.Body>
                    <Card.Title>Candy Machine </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted"><a href={"https://github.com/cryptoisgood/icp-candymachine"}>Github</a></Card.Subtitle>
                        {!connected &&
                            <PlugConnect
                                dark
                                whitelist={canister}
                                host={host}
                                onConnectCallback={() => setConnected(true)}
                            />
                        }
                        {connected &&
                                <Container>
                                    <Row>
                                        <Col>
                                            <p>{leftToMintVar} of {maxTokensVar} minted</p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col><Button onClick={mint} variant="outline-primary">Mint</Button></Col>
                                    </Row>
                                </Container>
                        }
                </Card.Body>
            </Card>
        </div>
    );
}

export default App