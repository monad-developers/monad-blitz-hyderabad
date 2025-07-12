import { CONFIG } from "../config";

export interface BrewitSwapRequest {
  payload: {
    fromToken?: string;
    toToken?: string;
    token?: string;
    toAddress?: string;
    amount: string;
    accountAddress: string;
    validatorSalt: string;
  };
  task: string;
  times: number;
  repeat: number;
  name: string;
  enabled: boolean;
}

export const swap = async (fromToken: string, toToken: string, amount: string, recurring:number, timeGap: number) => {
  const requestBody: BrewitSwapRequest = {
    payload: {
      fromToken,
      toToken,
      amount,
      accountAddress : CONFIG.brewit.account,
      validatorSalt: CONFIG.brewit.salt
    },
    task: "swap",
    times: recurring,
    repeat: timeGap,
    name: "monosms_swap",
    enabled: true
  };

  console.log(requestBody);

  const response = await fetch(`https://api.brewit.money/automation/agents/monad`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Brewit API error: ${response.status} ${response.statusText}`);
  }
  console.log("response ", response.body)

  return await response.json();
}


export const send = async (toToken: string, toAddress: string, amount: string, recurring:number, timeGap:number) => {
    const requestBody: BrewitSwapRequest = {
      payload: {
        token: toToken,
        toAddress,
        amount,
        accountAddress : CONFIG.brewit.account,
        validatorSalt: CONFIG.brewit.salt
      },
      task: "send",
      times: recurring,
      repeat: timeGap,
      name: "monosms_swap",
      enabled: true
    };
  
    console.log(requestBody);
  
    const response = await fetch(`https://api.brewit.money/automation/agents/monad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
  
    if (!response.ok) {
      throw new Error(`Brewit API error: ${response.status} ${response.statusText}`);
    }
    console.log("response ", response.body)
  
    return await response.json();
}