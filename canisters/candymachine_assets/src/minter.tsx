import * as React from "react";
import {Button, Card, Col, Container, Modal, Overlay, OverlayTrigger, Row, Spinner, Tooltip} from "react-bootstrap";
import {canisterId as nftCanister} from "../../declarations/candymachine_dip721";
import {canisterId as candyMachineCanister, idlFactory} from "../../declarations/candymachine";
import {atom, useRecoilState} from "recoil";
import {useEffect} from "react";
import {leftToMint, maxTokens} from "./candymachine";
import {
    canisterAtom,
    connectedAtom,
    hostAtom, isAdminAtom,
    isInitiatedAtom,
    leftToMintAtom,
    loadingAtom,
    maxTokensAtom, mintedAtom
} from "./atoms";
import {_SERVICE} from "../../declarations/candymachine/candymachine.did";

const Minter: React.FC = () => {

    const [isAdmin, setIsAdmin] = useRecoilState(isAdminAtom);
    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [minted, setMinted] = useRecoilState(mintedAtom);
    const [maxTokensVar, setMaxTokensVar] = useRecoilState(maxTokensAtom);
    const [leftToMintVar, setLeftOverTokensVar] = useRecoilState(leftToMintAtom);
    const [canister, setCanister] = useRecoilState(canisterAtom);
    const [host, setHost] = useRecoilState(hostAtom);
    const [initiated, setIsInitiated] = useRecoilState(isInitiatedAtom);


    useEffect(() => {
        if (initiated) {
            setCanister([nftCanister, candyMachineCanister]);
            maxTokens().then((resp) => {
                if (resp.Ok) {
                    setMaxTokensVar(Number(resp.Ok))
                }
                console.log(resp);
            });
            leftToMint().then((resp) => {
                setLeftOverTokensVar(Number(resp));
            });
        }
    }, [initiated]);

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
        const resp = await NNSUiActor.mint();
        console.log(resp);
        leftToMint().then((resp) => {
            setLeftOverTokensVar(Number(resp));
            setLoading(false);
            setMinted(true);
        });
    }


    return (
        <>
            <Container>
                {/*<Row>*/}
                {/*    <Col>*/}
                {/*        {initiated &&*/}
                {/*            <p>{leftToMintVar} of {maxTokensVar} minted</p>*/}
                {/*        }*/}
                {/*    </Col>*/}
                {/*</Row>*/}
                <Row>
                    <Col>
                        <h1 className={"title"}>SOLD OUT</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Mint</Tooltip>}>
                            <Button className={"mint-button"} disabled={true} onClick={mint} variant="outline-primary">
                                <img className={"margin-cube"} src={"cube.png"}/>
                            </Button>
                        </OverlayTrigger>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Minter