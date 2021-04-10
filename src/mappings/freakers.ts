import { BigInt, Bytes, Address, log } from "@graphprotocol/graph-ts";
import {
  Born,
  Missed,
  Thwarted,
  Captured,
  Transfer,
  EtherFreakers as freakersContract,
  TapCall,
  ChargeCall,
  DischargeCall,
} from "../types/EtherFreakers/EtherFreakers";
import { Freaker, EtherFreakers, Account } from "../types/schema";
import {
  createSpecies,
  createEtherFreakers,
  isEnlightened,
  updateFreakerCount,
  updateGlobalFreakerCount,
  createOrLoadAccount,
} from "./helpers";

export function handleBorn(event: Born): void {
  let contract = freakersContract.bind(event.address);
  let freaker = new Freaker(event.params.freakerId.toString());

  freaker.species = BigInt.fromI32(event.params.freaker.species).toString();
  freaker.stamina = event.params.freaker.stamina;
  freaker.fortune = event.params.freaker.fortune;
  freaker.agility = event.params.freaker.agility;
  freaker.offense = event.params.freaker.offense;
  freaker.defense = event.params.freaker.defense;
  freaker.totalScore =
    freaker.stamina +
    freaker.fortune +
    freaker.agility +
    freaker.offense +
    freaker.defense;
  freaker.mother = event.params.mother;
  freaker.owner = event.params.mother.toHexString();
  freaker.tokenURI = contract.tokenURI(event.params.freakerId);
  freaker.isImmortal = false; // we know its false, born events not emitted for immortals
  let energies = contract.energyBalances(event.params.freakerId);
  freaker.energyBalanceBasic = energies.value0;
  freaker.energyBalanceIndex = energies.value1;

  freaker.bornAtBlock = event.block.number.toI32();
  freaker.bornAtTime = event.block.timestamp.toI32();
  freaker.attackerMissedCounts = 0;
  freaker.defenderMissedCounts = 0;
  freaker.attackerThwartedCounts = 0;
  freaker.defenderThwartedCounts = 0;
  freaker.attackerCapturedCounts = 0;
  freaker.defenderCapturedCounts = 0;
  freaker.save();

  let etherFreakers = EtherFreakers.load("1") as EtherFreakers;
  etherFreakers = updateGlobalFreakerCount(etherFreakers, freaker.species);
  etherFreakers.middlePrice = contract.middlePrice();
  etherFreakers.freakerIndex = contract.freakerIndex();
  etherFreakers.creatorIndex = contract.creatorIndex();
  etherFreakers.totalFortune = contract.totalFortune();
  let bcs = etherFreakers.birthCertificates;
  bcs.push(event.transaction.value);
  etherFreakers.birthCertificates = bcs;
  etherFreakers.save();
}

export function handleMissed(event: Missed): void {
  let attacked = Freaker.load(event.params.sourceId.toString());
  let contract = freakersContract.bind(event.address);
  let energies = contract.energyBalances(event.params.sourceId);
  attacked.energyBalanceBasic = energies.value0;
  attacked.energyBalanceIndex = energies.value1;
  attacked.attackerMissedCounts = attacked.attackerMissedCounts + 1;
  attacked.save();

  let defended = Freaker.load(event.params.targetId.toString());
  defended.defenderMissedCounts = defended.defenderMissedCounts + 1;
  defended.save();

  let etherFreakers = EtherFreakers.load("1");
  etherFreakers.freakerIndex = contract.freakerIndex();
  etherFreakers.creatorIndex = contract.creatorIndex();
  etherFreakers.missedAttackCounts = etherFreakers.missedAttackCounts + 1;
  etherFreakers.save();
}

export function handleThwarted(event: Thwarted): void {
  let attacked = Freaker.load(event.params.sourceId.toString());
  let contract = freakersContract.bind(event.address);
  let energies = contract.energyBalances(event.params.sourceId);
  attacked.energyBalanceBasic = energies.value0;
  attacked.energyBalanceIndex = energies.value1;
  attacked.attackerThwartedCounts = attacked.attackerThwartedCounts + 1;
  attacked.save();

  let defended = Freaker.load(event.params.targetId.toString());
  defended.defenderThwartedCounts = defended.defenderThwartedCounts + 1;
  defended.save();

  let etherFreakers = EtherFreakers.load("1");
  etherFreakers.freakerIndex = contract.freakerIndex();
  etherFreakers.creatorIndex = contract.creatorIndex();
  etherFreakers.thwartedAttackCounts = etherFreakers.thwartedAttackCounts + 1;

  etherFreakers.save();
}

export function handleCaptured(event: Captured): void {
  let attacked = Freaker.load(event.params.sourceId.toString());
  let contract = freakersContract.bind(event.address);
  let energies = contract.energyBalances(event.params.sourceId);
  attacked.energyBalanceBasic = energies.value0;
  attacked.energyBalanceIndex = energies.value1;
  attacked.attackerCapturedCounts = attacked.attackerCapturedCounts + 1;
  attacked.save();

  let defended = Freaker.load(event.params.targetId.toString());
  defended.defenderCapturedCounts = defended.defenderCapturedCounts + 1;
  defended.save();

  let etherFreakers = EtherFreakers.load("1");
  etherFreakers.freakerIndex = contract.freakerIndex();
  etherFreakers.creatorIndex = contract.creatorIndex();
  etherFreakers.capturedCounts = etherFreakers.capturedCounts + 1;
  etherFreakers.save();
}

export function handleTransfer(event: Transfer): void {
  let freaker: Freaker;
  let contract = freakersContract.bind(event.address);

  // when from is 0, its a mint
  if (
    event.params.from.toHexString() ==
    "0x0000000000000000000000000000000000000000"
  ) {
    freaker = new Freaker(event.params.tokenId.toString());
    let contract = freakersContract.bind(event.address);
    let storedFreaker = contract.freakers(event.params.tokenId);

    // need to manually index the 8 immortals here since no Born events
    if (event.params.tokenId.toI32() < 8) {
      // on first mint only
      if (event.params.tokenId.toI32() == 0) {
        createEtherFreakers();
        createSpecies();
      }
      freaker.species = BigInt.fromI32(storedFreaker.value0).toString();
      freaker.stamina = storedFreaker.value1;
      freaker.fortune = storedFreaker.value2;
      freaker.agility = storedFreaker.value3;
      freaker.offense = storedFreaker.value4;
      freaker.defense = storedFreaker.value5;
      freaker.totalScore =
        freaker.stamina +
        freaker.fortune +
        freaker.agility +
        freaker.offense +
        freaker.defense;
      // hardcode owner address
      freaker.mother = Bytes.fromHexString(
        "0x18c8f1222083997405f2e482338a4650ac02e1d6"
      ) as Bytes;
      freaker.owner = "0x18c8f1222083997405f2e482338a4650ac02e1d6";
      freaker.tokenURI = contract.tokenURI(event.params.tokenId);
      freaker.isImmortal = true;
      freaker.energyBalanceBasic = BigInt.fromI32(0);
      freaker.energyBalanceIndex = BigInt.fromI32(0);

      freaker.bornAtBlock = event.block.number.toI32();
      freaker.bornAtTime = event.block.timestamp.toI32();
      freaker.attackerMissedCounts = 0;
      freaker.defenderMissedCounts = 0;
      freaker.attackerThwartedCounts = 0;
      freaker.defenderThwartedCounts = 0;
      freaker.attackerCapturedCounts = 0;
      freaker.defenderCapturedCounts = 0;
    }
  } else {
    // normal transfer, or attack successful
    freaker = Freaker.load(event.params.tokenId.toString()) as Freaker;
    freaker.owner = event.params.to.toHexString();
  }
  freaker.save();

  // update to
  let to = createOrLoadAccount(event.params.to);
  to = updateFreakerCount(to as Account, true, freaker.species);
  to = isEnlightened(to as Account);
  let toMultipliers = contract.combatMultipliers(event.params.to);
  to.attackMultiplier = toMultipliers.value0;
  to.defendMultiplier = toMultipliers.value1;
  to.save();

  // update from
  let from = createOrLoadAccount(event.params.from);
  if (
    event.params.from.toHexString() !=
    "0x0000000000000000000000000000000000000000"
  ) {
    from = updateFreakerCount(from, false, freaker.species);
    from = isEnlightened(from);
    let fromMultipliers = contract.combatMultipliers(event.params.from);
    from.attackMultiplier = fromMultipliers.value0;
    from.defendMultiplier = fromMultipliers.value1;
    from.save();
  }

  // update Etherfreakers
  let etherFreakers = EtherFreakers.load("1");
  etherFreakers.freakerIndex = contract.freakerIndex();
  etherFreakers.creatorIndex = contract.creatorIndex();
  etherFreakers.save();
}

export function handleTap(call: TapCall): void {
  let creator = Freaker.load(call.inputs.creatorId.toString());
  let contract = freakersContract.bind(
    Address.fromString("0x3A275655586A049FE860Be867D10cdae2Ffc0f33")
  );
  let energies = contract.energyBalances(call.inputs.creatorId);
  creator.energyBalanceIndex = energies.value1;
  creator.save();
}

export function handleCharge(call: ChargeCall): void {
  let freaker = Freaker.load(call.inputs.freakerId.toString());
  let contract = freakersContract.bind(
    Address.fromString("0x3A275655586A049FE860Be867D10cdae2Ffc0f33")
  );
  let energies = contract.energyBalances(call.inputs.freakerId);
  freaker.energyBalanceBasic = energies.value0;
  freaker.energyBalanceIndex = energies.value1;
  freaker.save();
}

export function handleDischarge(call: DischargeCall): void {
  let freaker = Freaker.load(call.inputs.freakerId.toString());
  let contract = freakersContract.bind(
    Address.fromString("0x3A275655586A049FE860Be867D10cdae2Ffc0f33")
  );
  let energies = contract.energyBalances(call.inputs.freakerId);
  freaker.energyBalanceBasic = energies.value0;
  freaker.energyBalanceIndex = energies.value1;
  freaker.save();
}
