.PHONY: init candid build local stop-replica test format lint clean

LOCAL_CUSTODIAN_PRINCIPAL="$(shell dfx identity get-principal)"

init:
	npm --prefix test i
	cargo check

candid:
	cargo run > canisters/candymachine_rust_dip721/src/main.did

build: candid
	dfx ping local || dfx start --clean --background
	dfx canister create candymachine_rust_dip721
	dfx build candymachine_rust_dip721

local: build
	dfx deploy candymachine_rust_dip721 --argument '(opt record{custodians=opt vec{principal"$(LOCAL_CUSTODIAN_PRINCIPAL)"}})'

stop-replica:
	dfx stop

format:
	npm --prefix test run prettier
	npm --prefix test run lint
	cargo fmt --all

lint:
	npm --prefix test run prebuild
	cargo fmt --all -- --check
	cargo clippy --all-targets --all-features -- -D warnings -D clippy::all

clean:
	cargo clean
	npm --prefix test run clean
