export type Role = 'student' | 'teacher';

export interface Participant {
	clientId: string;
	displayName: string;
	role: Role;
}

export interface JoinRoomPayload {
	pollId: string;
	role: Role;
	clientId: string;
	displayName: string;
}

export interface QuestionStartedEvent {
	questionId: string;
	text: string;
	options: { optionId: string; text: string }[];
	timeLimit: number;
}

export interface QuestionAdminEvent extends QuestionStartedEvent {
	options: { optionId: string; text: string; isCorrect?: boolean }[];
}

export interface LiveUpdateEvent {
	questionId: string;
	counts: Record<string, number>;
	total: number;
	percentages: Record<string, number>;
	expectedRespondents: number;
}

export interface QuestionEndedEvent extends LiveUpdateEvent {}