import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Born,
  Missed,
  Thwarted,
  Captured,
  Transfer,
  EtherFreakers as freakersContract,
} from "../types/EtherFreakers/EtherFreakers";

import { Freaker, Species, EtherFreakers } from "../types/schema";

// birth = total fortunre, birthcerts,
// others  = creator index, freaker indexer

export function handleBorn(event: Born): void {
  let freaker = new Freaker(event.params.freakerId.toString());
  freaker.owner = event.params.mother;
  freaker.mother = event.params.mother;
  freaker.energy = event.params.energy;
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
  freaker.bornAtBlock = event.block.number.toI32();
  freaker.bornAtTime = event.block.timestamp.toI32();
  freaker.isImmortal = false; // we know its false, born events not emitted for immortals
  freaker.missedAttackCounts = 0;
  freaker.thwartedAttackCounts = 0;
  freaker.capturedCounts = 0;

  let contract = freakersContract.bind(event.address);
  freaker.tokenURI = contract.tokenURI(event.params.freakerId);

  freaker.save();
}

export function handleMissed(event: Missed): void {
  // count instances TODO
}

export function handleThwarted(event: Thwarted): void {
  // count instances TODO
}

export function handleCaptured(event: Captured): void {
  // count instances TODO
}

export function handleTransfer(event: Transfer): void {
  let freaker: Freaker;

  // note - no burns are possible TODO - not true - just transfer to 0x00
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
      // freaker.energy = event.params.energy; TODO fix
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
      freaker.bornAtBlock = event.block.number.toI32();
      freaker.bornAtTime = event.block.timestamp.toI32();
      freaker.isImmortal = true;
      freaker.tokenURI = contract.tokenURI(event.params.tokenId);
      freaker.missedAttackCounts = 0;
      freaker.thwartedAttackCounts = 0;
      freaker.capturedCounts = 0;

      // hardcode owner address
      freaker.mother = Bytes.fromHexString(
        "0x18c8f1222083997405f2e482338a4650ac02e1d6"
      ) as Bytes;
      freaker.owner = Bytes.fromHexString(
        "0x18c8f1222083997405f2e482338a4650ac02e1d6"
      ) as Bytes;
    }
  } else {
    freaker = Freaker.load(event.params.tokenId.toString()) as Freaker;
    freaker.owner = event.params.to;
  }

  freaker.save();
}

function createSpecies(): void {
  let species0 = new Species("0");
  species0.speciesName = "pluto";
  species0.bornOdds = 5;
  species0.maxStamina = 9;
  species0.maxFortune = 30;
  species0.maxAgility = 10;
  species0.maxOffense = 20;
  species0.maxDefense = 10;
  species0.save();

  let species1 = new Species("1");
  species1.speciesName = "mercury";
  species1.bornOdds = 10;
  species1.maxStamina = 9;
  species1.maxFortune = 30;
  species1.maxAgility = 10;
  species1.maxOffense = 10;
  species1.maxDefense = 20;
  species1.save();

  let species2 = new Species("2");
  species2.speciesName = "saturn";
  species2.bornOdds = 10;
  species2.maxStamina = 9;
  species2.maxFortune = 30;
  species2.maxAgility = 20;
  species2.maxOffense = 10;
  species2.maxDefense = 10;
  species2.save();

  let species3 = new Species("3");
  species3.speciesName = "uranus";
  species3.bornOdds = 15;
  species3.maxStamina = 9;
  species3.maxFortune = 10;
  species3.maxAgility = 10;
  species3.maxOffense = 30;
  species3.maxDefense = 20;
  species3.save();

  let species4 = new Species("4");
  species4.speciesName = "venus";
  species4.bornOdds = 15;
  species4.maxStamina = 9;
  species4.maxFortune = 10;
  species4.maxAgility = 10;
  species4.maxOffense = 20;
  species4.maxDefense = 30;
  species4.save();

  let species5 = new Species("5");
  species5.speciesName = "mars";
  species5.bornOdds = 20;
  species5.maxStamina = 9;
  species5.maxFortune = 10;
  species5.maxAgility = 30;
  species5.maxOffense = 20;
  species5.maxDefense = 10;
  species5.save();

  let species6 = new Species("6");
  species6.speciesName = "neptune";
  species6.bornOdds = 20;
  species6.maxStamina = 9;
  species6.maxFortune = 10;
  species6.maxAgility = 30;
  species6.maxOffense = 10;
  species6.maxDefense = 20;
  species6.save();

  let species7 = new Species("7");
  species7.speciesName = "jupiter";
  species7.bornOdds = 5;
  species7.maxStamina = 9;
  species7.maxFortune = 10;
  species7.maxAgility = 20;
  species7.maxOffense = 10;
  species7.maxDefense = 30;
  species7.save();
}

function createEtherFreakers(): void {
  let ef = new EtherFreakers("1");
  ef.birthCertificates = [];
  ef.creatorIndex = BigInt.fromI32(0);
  ef.freakerIndex = BigInt.fromI32(0);
  ef.totalFortune = BigInt.fromI32(0);
  ef.middlePrice = BigInt.fromI32(0);

  ef.missedAttackCounts = 0;
  ef.thwartedAttackCounts = 0;
  ef.capturedCounts = 0;
  ef.plutoCount = 0;
  ef.mercuryCount = 0;
  ef.saturnCount = 0;
  ef.uranusCount = 0;
  ef.venusCount = 0;
  ef.marsCount = 0;
  ef.neptuneCount = 0;
  ef.jupiterCount = 0;
  ef.save();
}
