/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
// services and configs
import { TraceStoreService } from './trace-store.service';
import { TAB, ItabItem, ITransactionList, IStage } from './trace.config';
import { ICarousal, IWizardStep } from 'src/app/shared/configs/app.model';

@Component({
  selector: 'app-trace',
  templateUrl: './trace.component.html',
  styleUrls: ['./trace.component.scss'],
})
export class TraceComponent implements OnInit, OnDestroy {
  // actor and transacitons tab
  tabItems = TAB;
  activeTab = TAB[0].id;

  imageUrl: ICarousal[] = [];
  pageApis: Subscription[] = [];
  // stage related
  stages: any;
  stagesLoaded: boolean;
  wizardData: IWizardStep[];
  activeStage: number;
  // actor related
  actorLoaded: boolean;
  selectedStageActors: any[]; // each stage could have multiple farmers/actors
  currentActiveActor: any; // selected actor
  activeActor: number; // active actor index inside stage actor list

  transactionLoaded: boolean;
  constructor(private store: TraceStoreService) {}

  ngOnInit(): void {
    this.transactionStageSub();
    this.otherSubscriptions();
  }

  transactionStageSub(): void {
    /**
     * Whenever trace component initialised this subscription will fire
     */
    const stageSub = this.store.transactionStages$.subscribe({
      next: (res: IStage) => {
        const { activeStage, stageList } = res;
        if (stageList.length) {
          this.stages = stageList;
          this.wizardData = stageList.map(a => {
            const subtext = a.actors.length > 1 ? `(${a.actors.length})` : '';
            return {
              title: `${a.tittle} ${subtext}`,
              subTitle: a.actor_name,
            };
          });
          this.activeStage = activeStage;
          this.stagesLoaded = true;
          this.updateActors();
        } else {
          this.stagesLoaded = false;
        }
      },
    });

    this.pageApis.push(stageSub);
  }

  otherSubscriptions(): void {
    /**
     * When stage selection changes actor list get updated
     * first actor will be selected
     */
    const actorSub = this.store.actorsData$.subscribe({
      next: (res: any) => {
        this.selectedStageActors = res;
        if (res.length) {
          this.activeActor = 0;
          this.selectActor();
          this.constructImageSlider();
        } else {
          this.actorLoaded = false;
        }
      },
    });
    const trSub = this.store.tableData$.subscribe({
      next: (res: ITransactionList) => {
        const { count, transactions } = res;
        if (transactions.length) {
          this.currentActiveActor.count = count;
          this.transactionLoaded = true;
        } else {
          this.transactionLoaded = false;
        }
      },
    });

    this.pageApis.push(actorSub);
    this.pageApis.push(trSub);
  }

  updateActors(): void {
    const stageActors = this.stages[this.activeStage].actors.map((a: any) => {
      return {
        ...a,
        location: `${a.province}, ${a.country}`,
        productName: a.products.map((pr: any) => pr.name).join(', '),
      };
    });
    // actor state is updated in store
    this.store.updateActors(stageActors);
    const products = this.stages[this.activeStage].stage_products.map(
      (p: string) => {
        return {
          name: p,
          id: p.trim(),
        };
      }
    );
    // product data is updated in store to use as a filter
    this.store.updateProducts(products);
  }

  /**
   * Each stage could contains multiple actors
   * Changing actors means refetching the transcations associated with actor
   *
   * Output from image slider component. Component will emit the changed index
   * @param index number
   */
  changeStageActor(index: number): void {
    if (index !== this.activeActor) {
      this.activeActor = index;
      this.selectActor();
    }
  }

  /**
   * When actor is selected
   * 1. Actor id is updated in store
   * 2. Transaction filter is reset
   * 3. Transaction filter is updated with selected actor
   * 4. Transaction table data is reset
   * 5. Transaction table data is updated with selected actor
   */
  selectActor(): void {
    this.currentActiveActor = this.selectedStageActors[this.activeActor];
    this.store.setActorId(this.currentActiveActor.id);
    this.store.resetTransactionFilter();
    this.store.updateFilter({
      selectedActor: this.currentActiveActor.id,
    });
    this.store.updateTableData({
      tableLoading: true,
      count: 0,
      transactions: [],
    });
    this.store.fetchActorTractions();
    this.actorLoaded = true;
  }

  /**
   * Construct image slider data
   */
  constructImageSlider(): void {
    this.imageUrl = this.selectedStageActors.map((b: any) => {
      return {
        title: b.name,
        subTitle: `${b.province ?? ''}, ${b.country ?? ''}`,
        imageUrl: b.image,
        defaultImage: b.name[0],
      };
    });
  }

  /**
   * When click on various stages
   * @param index number
   */
  stageSelection(index: number): void {
    if (index !== this.activeStage) {
      this.activeStage = index;
      this.actorLoaded = false;
      this.updateActors();
    }
  }

  /**
   * actor and transaction tab view switching
   * @param data ItabItem
   */
  changeTab(data: ItabItem): void {
    this.activeTab = data.id;
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
    this.store.updateStages(this.stages.length - 1);
  }
}
