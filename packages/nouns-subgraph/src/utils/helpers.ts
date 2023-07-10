import { BigInt } from '@graphprotocol/graph-ts';
import {
  Account,
  Delegate,
  Proposal,
  Governance,
  Vote,
  DynamicQuorumParams,
  ProposalVersion,
  ProposalCandidateVersion,
  ProposalCandidate,
  ProposalCandidateSignature,
  ProposalFeedback,
  Fork,
} from '../types/schema';
import { ZERO_ADDRESS, BIGINT_ZERO, BIGINT_ONE } from './constants';

export class GetOrCreateResult<T> {
  entity: T | null;
  created: boolean;

  constructor(entity: T | null, created: boolean) {
    this.entity = entity;
    this.created = created;
  }
}

export function getOrCreateAccount(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true,
): Account {
  let tokenHolder = Account.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new Account(id);
    tokenHolder.tokenBalanceRaw = BIGINT_ZERO;
    tokenHolder.tokenBalance = BIGINT_ZERO;
    tokenHolder.totalTokensHeldRaw = BIGINT_ZERO;
    tokenHolder.totalTokensHeld = BIGINT_ZERO;
    tokenHolder.nouns = [];

    if (save) {
      tokenHolder.save();
    }
  }

  return tokenHolder as Account;
}

// These two functions are split up to minimize the extra code required
// to handle return types with `Type | null`
export function getOrCreateDelegate(id: string): Delegate {
  return getOrCreateDelegateWithNullOption(id, true, true).entity!;
}

export function getOrCreateDelegateWithNullOption(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true,
): GetOrCreateResult<Delegate> {
  let delegate = Delegate.load(id);
  let created = false;
  if (delegate == null && createIfNotFound) {
    created = true;
    delegate = new Delegate(id);
    delegate.delegatedVotesRaw = BIGINT_ZERO;
    delegate.delegatedVotes = BIGINT_ZERO;
    delegate.tokenHoldersRepresentedAmount = 0;
    delegate.nounsRepresented = [];
    if (id != ZERO_ADDRESS) {
      let governance = getGovernanceEntity();
      governance.totalDelegates = governance.totalDelegates.plus(BIGINT_ONE);
      governance.save();
    }
    if (save) {
      delegate.save();
    }
  }

  return new GetOrCreateResult<Delegate>(delegate, created);
}

export function getOrCreateVote(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = false,
): Vote {
  let vote = Vote.load(id);

  if (vote == null && createIfNotFound) {
    vote = new Vote(id);

    if (save) {
      vote.save();
    }
  }

  return vote as Vote;
}

export function getOrCreateProposal(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = false,
): Proposal {
  let proposal = Proposal.load(id);

  if (proposal == null && createIfNotFound) {
    proposal = new Proposal(id);

    let governance = getGovernanceEntity();

    governance.proposals = governance.proposals.plus(BIGINT_ONE);
    governance.save();

    if (save) {
      proposal.save();
    }
  }

  return proposal as Proposal;
}

export function getGovernanceEntity(): Governance {
  let governance = Governance.load('GOVERNANCE');

  if (governance == null) {
    governance = new Governance('GOVERNANCE');
    governance.proposals = BIGINT_ZERO;
    governance.totalTokenHolders = BIGINT_ZERO;
    governance.currentTokenHolders = BIGINT_ZERO;
    governance.currentDelegates = BIGINT_ZERO;
    governance.totalDelegates = BIGINT_ZERO;
    governance.delegatedVotesRaw = BIGINT_ZERO;
    governance.delegatedVotes = BIGINT_ZERO;
    governance.proposalsQueued = BIGINT_ZERO;
  }

  return governance as Governance;
}

export function getOrCreateDynamicQuorumParams(block: BigInt | null = null): DynamicQuorumParams {
  let params = DynamicQuorumParams.load('LATEST');

  if (params == null) {
    params = new DynamicQuorumParams('LATEST');
    params.minQuorumVotesBPS = 0;
    params.maxQuorumVotesBPS = 0;
    params.quorumCoefficient = BIGINT_ZERO;
    params.dynamicQuorumStartBlock = block;

    params.save();
  }

  if (params.dynamicQuorumStartBlock === null && block !== null) {
    params.dynamicQuorumStartBlock = block;

    params.save();
  }

  return params as DynamicQuorumParams;
}

export function getOrCreateProposalVersion(id: string): ProposalVersion {
  let update = ProposalVersion.load(id);
  if (update == null) {
    update = new ProposalVersion(id);
  }
  return update;
}

export function getOrCreateProposalCandidate(id: string): ProposalCandidate {
  let candidate = ProposalCandidate.load(id);
  if (candidate == null) {
    candidate = new ProposalCandidate(id);
  }
  return candidate;
}

export function getOrCreateProposalCandidateVersion(id: string): ProposalCandidateVersion {
  let version = ProposalCandidateVersion.load(id);
  if (version == null) {
    version = new ProposalCandidateVersion(id);
  }
  return version;
}

export function getOrCreateProposalCandidateSignature(id: string): ProposalCandidateSignature {
  let sig = ProposalCandidateSignature.load(id);
  if (sig == null) {
    sig = new ProposalCandidateSignature(id);
  }
  return sig;
}

export function getOrCreateProposalFeedback(id: string): ProposalFeedback {
  let feedback = ProposalFeedback.load(id);
  if (feedback == null) {
    feedback = new ProposalFeedback(id);
  }
  return feedback;
}

export function getOrCreateFork(id: BigInt): Fork {
  let fork = Fork.load(id.toString());
  if (fork == null) {
    fork = new Fork(id.toString());
    fork.forkID = id;
    fork.tokensInEscrowCount = 0;
    fork.tokensForkingCount = 0;
  }
  return fork;
}
