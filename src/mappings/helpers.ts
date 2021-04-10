import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Species, EtherFreakers, Account } from "../types/schema";

export function createSpecies(): void {
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

export function createEtherFreakers(): void {
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

export function createOrLoadAccount(account: Address): Account {
  let acct = Account.load(account.toHexString());
  if (acct == null) {
    acct = new Account(account.toHexString());
  }
  acct.plutoCount = 0;
  acct.mercuryCount = 0;
  acct.saturnCount = 0;
  acct.uranusCount = 0;
  acct.venusCount = 0;
  acct.marsCount = 0;
  acct.neptuneCount = 0;
  acct.jupiterCount = 0;
  acct.isEnlightened = false;
  acct.attackMultiplier = BigInt.fromI32(0);
  acct.defendMultiplier = BigInt.fromI32(0);
  return acct as Account;
}

export function isEnlightened(account: Account): Account {
  if (
    account.plutoCount > 0 &&
    account.mercuryCount > 0 &&
    account.saturnCount > 0 &&
    account.uranusCount > 0 &&
    account.venusCount > 0 &&
    account.marsCount > 0 &&
    account.neptuneCount > 0 &&
    account.jupiterCount > 0
  ) {
    account.isEnlightened = true;
  } else {
    account.isEnlightened = false;
  }
  return account;
}

export function updateFreakerCount(
  account: Account,
  increase: boolean,
  species: string
): Account {
  let incrementer: i32;
  increase ? (incrementer = 1) : (incrementer = -1);
  if (species == "0") {
    account.plutoCount = account.plutoCount + incrementer;
  } else if (species == "1") {
    account.mercuryCount = account.mercuryCount + incrementer;
  } else if (species == "2") {
    account.saturnCount = account.saturnCount + incrementer;
  } else if (species == "3") {
    account.uranusCount = account.uranusCount + incrementer;
  } else if (species == "4") {
    account.venusCount = account.venusCount + incrementer;
  } else if (species == "5") {
    account.marsCount = account.marsCount + incrementer;
  } else if (species == "6") {
    account.neptuneCount = account.neptuneCount + incrementer;
  } else if (species == "7") {
    account.jupiterCount = account.jupiterCount + incrementer;
  }
  return account;
}

export function updateGlobalFreakerCount(
  ef: EtherFreakers,
  species: string
): EtherFreakers {
  if (species == "0") {
    ef.plutoCount = ef.plutoCount + 1;
  } else if (species == "1") {
    ef.mercuryCount = ef.mercuryCount + 1;
  } else if (species == "2") {
    ef.saturnCount = ef.saturnCount + 1;
  } else if (species == "3") {
    ef.uranusCount = ef.uranusCount + 1;
  } else if (species == "4") {
    ef.venusCount = ef.venusCount + 1;
  } else if (species == "5") {
    ef.marsCount = ef.marsCount + 1;
  } else if (species == "6") {
    ef.neptuneCount = ef.neptuneCount + 1;
  } else if (species == "7") {
    ef.jupiterCount = ef.jupiterCount + 1;
  }
  return ef;
}
