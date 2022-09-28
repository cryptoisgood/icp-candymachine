import * as React from "react";
import {Button, Card, Col, Container, Image, Modal, Row, Spinner} from "react-bootstrap";
import PlugConnect from '@psychedelic/plug-connect';
import {canisterId as nftCanister} from "../../declarations/candymachine_dip721";
import {canisterId as candyMachineCanister, idlFactory} from "../../declarations/candymachine";
import {atom, useRecoilState} from "recoil";
import {useEffect} from "react";
import {
    canisterAtom,
    connectedAtom,
    hostAtom,
    isAdminAtom,
    isInitiatedAtom,
    loadingAtom,
    mintedAtom
} from "./atoms";
import Minter from "./minter";
import {config} from "./candymachine-config";
import AdminConfig from "./admin-config";
import {isInit} from "./candymachine";
import Countdown from "react-countdown";

const App: React.FC = () => {
    const [initiated, setIsInitiated] = useRecoilState(isInitiatedAtom);

    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [canister, setCanister] = useRecoilState(canisterAtom);
    const [isAdmin, setIsAdmin] = useRecoilState(isAdminAtom);
    const [host, setHost] = useRecoilState(hostAtom);
    const [minted, setMinted] = useRecoilState(mintedAtom);

    const isDevelopment = process.env.NODE_ENV !== "production";
    if (isDevelopment) {
        console.log("started in dev");
        setHost("http://127.0.0.1:8000/");
    }

    useEffect(() => {
        setCanister([nftCanister, candyMachineCanister]);
        checkInit().then();
    }, []);
    async function checkInit() {
        console.log("checked if initiated")
        const isInitiated = await isInit();
        console.log(isInitiated);
        if (isInitiated) {
            setIsInitiated(true);
        }
    }

    async function afterConnected() {
        setConnected(true);
        const publicKey = await (window as any).ic.plug.agent.getPrincipal();
        if (publicKey.toString() === config.PLUG_ADMIN_PRINCIPAL) {
            setIsAdmin(true);
        }
    }
    const Completionist = () => <span>Box has been opened</span>;

    const renderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            // Render a completed state
            return <Completionist />;
        } else {
            // Render a countdown
            return <>
            <div className="counter">
                <div className="time">
                    <div className="time-value">{days.toString().padStart(2, '0')}</div>
                    <div className="time-label">Days</div>
                </div>
                <div className="time">
                    <div className="time-value">{hours.toString().padStart(2, '0')}</div>
                    <div className="time-label">Hours</div>
                </div>
                <div className="time">
                    <div className="time-value">{minutes.toString().padStart(2, '0')}</div>
                    <div className="time-label">Minutes</div>
                </div>
                <div className="time">
                    <div className="time-value">{seconds.toString().padStart(2, '0')}</div>
                    <div className="time-label">Seconds</div>
                </div>
            </div>
            </>

        }
    };

    return (
        <>

            <div className={"title-align viewp"}>
                {isAdmin &&
                    <AdminConfig></AdminConfig>
                }
                <img src={"label.png"}/>
                <h1 className={"title"}>SECRET BOX NFT</h1>
                <p className={"white-text"}>Use desktop for better experience</p>
                <> { !minted && <>
                    {!connected &&
                        <>
                        <PlugConnect
                            dark
                            whitelist={canister}
                            host={host}
                            onConnectCallback={afterConnected}
                        />
                            <a className={"block-link"} target={"none"} href={"https://medium.com/plugwallet/how-to-setup-a-wallet-in-plug-quick-guide-6504daaa37e9"}>What is Plug Wallet</a>
                            <img className={"margin-cube"} src={"cube.png"}/>
                            </>
                    }


                    {connected &&
                        <Minter></Minter>
                    }
                    </>
                }
                    {!minted &&
                        <h3 className={"font-body"}>Click on The Box to mint it for free. You'll receive airdrops on your Plug Wallet until countdown</h3>
                    }
                    {minted && <>
                        <img className={"margin-cube"} src={"cube.png"}/>
                        <h3 className={"font-body"}>Check your wallet for the box NFT</h3>
                        <h3 className={"font-body"}>Airdrops every few days till the end of countdown</h3>
                        <h3 className={"font-body"}>Limited Edition</h3>
                        </>
                    }

                <Countdown className={"timer"} renderer={renderer} date={1666043233000}/>
                </>
            </div>
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

            </div>
        </>
    );
}

export default App