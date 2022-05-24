import * as React from "react";
import {useRecoilState} from "recoil";
import {hostAtom, isInitiatedAtom, loadingAtom} from "./atoms";
import {_SERVICE as dip721Service} from "../../declarations/candymachine_dip721/candymachine_dip721.did";
import {canisterId as dip721contract, idlFactory as dip721Factory} from "../../declarations/candymachine_dip721";
import {canisterId as candymachineContract, idlFactory as candyMachineFactory} from "../../declarations/candymachine";
import {config} from "./candymachine-config";
import {Principal} from "@dfinity/principal";
import {_SERVICE as candymachineService} from "../../declarations/candymachine/candymachine.did";
import {Button} from "react-bootstrap";

const AdminConfig: React.FC = () => {
    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [initiated] = useRecoilState(isInitiatedAtom);


    async function initiateCandyMachine() {
        // Initialise Agent, expects no return value
        setLoading(true);


        const dip721Actor: dip721Service = await (window as any).ic.plug.createActor({
            canisterId: dip721contract,
            interfaceFactory: dip721Factory,
        });

        const candyMachinePrincipal = Principal.fromText(candymachineContract);
        const plugPrincipal = Principal.fromText(config.PLUG_ADMIN_PRINCIPAL);
        console.log("starting custodian setup")
        await dip721Actor.setCustodians([candyMachinePrincipal, plugPrincipal]);
        await dip721Actor.setLogo(config.COLLECTION_LOGO);
        await dip721Actor.setName(config.COLLECTION_NAME);
        await dip721Actor.setSymbol(config.COLLECTION_SYMBOL);
        console.log("finished custodian setup")
        const candymachineActor: candymachineService = await (window as any).ic.plug.createActor({
            canisterId: candymachineContract,
            interfaceFactory: candyMachineFactory,
        });
        await candymachineActor.setNftCanister(dip721contract);
        const canisterContract = await candymachineActor.getNftCanister();
        if (dip721contract === canisterContract) {
            console.log("success");
        }

        await candymachineActor.initiateMint();
        setLoading(false);
        window.location.reload();
    }

    return (
        <>
            <p className={initiated ? "text-success" : "text-danger"}>{initiated ? "Configured" : "Not configured"}</p>
            <Button onClick={initiateCandyMachine}>Configure candymachine</Button>
        </>
    );
}

export default AdminConfig