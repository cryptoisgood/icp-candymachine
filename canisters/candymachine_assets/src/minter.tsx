import * as React from "react";
import {Button, Card, Col, Container, Modal, Row, Spinner} from "react-bootstrap";
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
    maxTokensAtom
} from "./atoms";
import {_SERVICE} from "../../declarations/candymachine/candymachine.did";

const Minter: React.FC = () => {

    const [isAdmin, setIsAdmin] = useRecoilState(isAdminAtom);
    const [loading, setLoading] = useRecoilState(loadingAtom);
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
        const resp = await NNSUiActor.mint("");
        console.log(resp);
        leftToMint().then((resp) => {
            setLeftOverTokensVar(Number(resp));
            setLoading(false);
        });
    }


    return (
        <>
            <Container>
                <Row>
                    <Col>
                        {initiated &&
                            <p>{leftToMintVar} of {maxTokensVar} minted</p>
                        }
                    </Col>
                </Row>
                <Row>
                    <Col><Button disabled={!initiated} onClick={mint} variant="outline-primary">Mint</Button></Col>
                </Row>
            </Container>
        </>
    );
}

export default Minter