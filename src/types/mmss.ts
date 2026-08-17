export interface MMSSDetails {
  N_total: number;
  N_content: number;
  N_structure: number;
  mu_depth: number;
  sigma_depth: number;
  N_empty_wrappers: number;
  C_total: number;
  C_unique: number;
  C_raw_unique: number;
  C_noisy: number;
  A_total: number;
  A_suspicious: number;
  N_levels: number;
  N_nodes: number;
}

export interface MMSSMetrics {
  V: number;
  S: number;
  N: number;
  Df: number;
  QEC: number;
  details: MMSSDetails;
}
