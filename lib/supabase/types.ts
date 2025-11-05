export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			trade_setups: {
				Row: {
					id: string;
					company_id: string;
					user_id: string;
					user_name: string | null;
					analysis: string;
					trade_setup: Json;
					quality_score: number | null;
					direction: string | null;
					image_url: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					company_id: string;
					user_id: string;
					user_name?: string | null;
					analysis: string;
					trade_setup: Json;
					quality_score?: number | null;
					direction?: string | null;
					image_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					company_id?: string;
					user_id?: string;
					user_name?: string | null;
					analysis?: string;
					trade_setup?: Json;
					quality_score?: number | null;
					direction?: string | null;
					image_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			knowledge: {
				Row: {
					id: string;
					trade_setup_id: string | null;
					company_id: string;
					content: string;
					embedding: number[] | null;
					metadata: Json | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					trade_setup_id?: string | null;
					company_id: string;
					content: string;
					embedding?: number[] | null;
					metadata?: Json | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					trade_setup_id?: string | null;
					company_id?: string;
					content?: string;
					embedding?: number[] | null;
					metadata?: Json | null;
					created_at?: string;
				};
			};
			feedback: {
				Row: {
					id: string;
					trade_setup_id: string | null;
					company_id: string;
					user_id: string;
					user_name: string | null;
					feedback_text: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					trade_setup_id?: string | null;
					company_id: string;
					user_id: string;
					user_name?: string | null;
					feedback_text: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					trade_setup_id?: string | null;
					company_id?: string;
					user_id?: string;
					user_name?: string | null;
					feedback_text?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
	};
}

