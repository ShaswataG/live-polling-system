// frontend/src/types/poll.types.ts
export interface PollConfig {
	defaultTimeLimit?: number;
}

export interface PollMeta {
	_id?: string;
	pollId: string;
	title: string;
	status?: 'draft' | 'active' | 'closed';
	currentQuestionId?: string | null;
	config?: PollConfig;
}

export interface QuestionStatsDoc {
	questionId: string;
	counts: Record<string, number>;
	total: number;
}