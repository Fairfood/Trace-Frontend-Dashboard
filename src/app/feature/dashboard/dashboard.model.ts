import { ICommonObj } from 'src/app/shared/configs/app.model';

export interface IMapTheme {
  colour_map_background: string;
  colour_map_marker: string;
  colour_map_clustor: string;
  colour_map_marker_text: string;
}

export interface ICordinates {
  latitude: number;
  longitude: number;
}

export interface IDashboardProducts extends ICommonObj {
  quantity: number;
}

export interface ISupplyChainOverview extends ICommonObj {
  active_actor_count: number;
  actor_count: number;
  chain_length: number;
  company_count: number;
  farmer_count: number;
  complexity: number;
  tier_count: number;
}

export interface IStatItem {
  name: string;
  count: number;
}

export interface IOperationStats {
  farmer: IStatItem[];
  supplier: IStatItem[];
}

export interface IDashboardStatistics {
  active_actor_count: number;
  actor_count: number;
  chain_length: number;
  company_count: number;
  farmer_count: number;
  invited_actor_count: number;
  mapped_actor_count: number;
  pending_invite_count: number;
  supplier_count: number;
  supply_chain_count: number;
  tier_count: number;
  traceable_chain_percentage: number;
  traceable_chains: number;
  operation_stats: IOperationStats;
  collectorCount?: number;
}
export interface IDashboardStatus {
  actions: any[];
  chains_with_stock: Partial<ICommonObj>[];
  company_claims: Partial<ICommonObj>[];
  farmer_chains: Partial<ICommonObj>[];
  farmers: ICordinates[];
  incomplete_chains: any[];
  product_claims: any[];
  products: IDashboardProducts[];
  selected_supply_chain: string;
  statistics?: any;
  supplier_chains: Partial<ICommonObj>[];
  supply_chain_overview?: ISupplyChainOverview[];
  suppliers: ICordinates[];
}

export interface IChartData {
  labels: string[];
  values: number[];
  colors: string[];
}
