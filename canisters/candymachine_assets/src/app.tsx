import * as React from "react";
import {Button, Card, Col, Container, Modal, Row, Spinner} from "react-bootstrap";
import PlugConnect from '@psychedelic/plug-connect';
import {canisterId as nftCanister} from "../../declarations/candymachine_dip721";
import {canisterId as candyMachineCanister, idlFactory} from "../../declarations/candymachine";
import {atom, useRecoilState} from "recoil";
import {useEffect} from "react";
import {canisterAtom, connectedAtom, hostAtom, isAdminAtom, leftToMintAtom, loadingAtom, maxTokensAtom} from "./atoms";
import Minter from "./minter";
import {config} from "../../../candymachine-config";
import AdminConfig from "./admin-config";

const App: React.FC = () => {

    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [canister, setCanister] = useRecoilState(canisterAtom);
    const [isAdmin, setIsAdmin] = useRecoilState(isAdminAtom);
    const [host, setHost] = useRecoilState(hostAtom);
    const isDevelopment = process.env.NODE_ENV !== "production";
    if (isDevelopment) {
        console.log("started in dev");
        setHost("http://127.0.0.1:8000/");
    }

    useEffect(() => {
        setCanister([nftCanister, candyMachineCanister]);
    }, []);



    async function afterConnected() {
        setConnected(true);
        const publicKey = await (window as any).ic.plug.agent.getPrincipal();
        if (publicKey.toString() === config.PLUG_ADMIN_PRINCIPAL) {
            setIsAdmin(true);
        }
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
                            onConnectCallback={afterConnected}
                        />
                    }
                    {isAdmin &&
                        <AdminConfig></AdminConfig>
                    }

                    {connected &&
                        <Minter></Minter>
                    }
                </Card.Body>
            </Card>
        </div>
    );
}

export default App