import express from "express";
const app = express();
const port = 3005;

const erc20Abi = require("utils/abi/erc20.json");

import Web3 from "web3";
import { toBN, Unit } from "web3-utils";

interface Token {
  name: string;
  address: string;
  decimals?: number;
}

const getUnit = async (
  token: Token,
  myWeb3?: Web3
): Promise<Unit | undefined> => {
  if (myWeb3) {
    const contract = new myWeb3.eth.Contract(erc20Abi, token.address);
    const decimals =
      token.decimals ?? (await contract.methods.decimals().call());
    return Object.entries(myWeb3.utils.unitMap).find(([_key, value]) => {
      return value === toBN(10).pow(toBN(decimals)).toString();
    })?.[0] as Unit; // auto returns undefined if not found
  }
};

app.get("/", (req, res) => {
  const web3Obj = new Web3(); // use alchemy archive node

  const userAddr = "0x8D6F070e5e3F73758426007dA680324C10C2869C"; // fnatiq

  const token: Token = {
    name: "MTOP",
    address: "0x4a986Bb7909D361F3191Ea08d0C4B328295841A4",
  };
  const { address } = token;

  const tokenAbi = web3Obj.utils.toChecksumAddress(address);
  const contract = new web3Obj.eth.Contract(erc20Abi, tokenAbi);

  contract.methods
    .balanceOf(userAddr)
    .call()
    .then((balance: string) => {
      getUnit(token, web3Obj)
        .then((unit) => {
          const tokenBalance = web3Obj.utils.fromWei(balance, unit);
          console.log(tokenBalance);
        })
        .catch((err) => {
          console.error("inside error", err);
        });
    })
    .catch((err: any) => {
      console.error("outside error", err);
    });
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
