import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { SwapTypeEnum } from '../../../shared/services/consts-enums-functions';
import { Channel } from '../../../shared/models/lndModels';
import { LoopModalComponent } from '../../loop/loop-modal/loop-modal.component';
import { LoopService } from '../../../shared/services/loop.service';

import * as fromRTLReducer from '../../../store/rtl.reducers';
import * as RTLActions from '../../../store/rtl.actions';

@Component({
  selector: 'rtl-channel-liquidity-info',
  templateUrl: './channel-liquidity-info.component.html',
  styleUrls: ['./channel-liquidity-info.component.scss']
})
export class ChannelLiquidityInfoComponent implements OnInit, OnDestroy {
  @Input() direction: string;
  @Input() totalLiquidity: number;
  @Input() allChannels: Channel[];
  public showLoop: boolean;
  private targetConf = 6;
  private unSubs: Array<Subject<void>> = [new Subject(), new Subject()];

  constructor(private router: Router, private loopService: LoopService, private store: Store<fromRTLReducer.RTLState>) {}

  ngOnInit() {
    this.store.select('lnd')
    .pipe(takeUntil(this.unSubs[0]))
    .subscribe((rtlStore) => {
      this.showLoop = (rtlStore.nodeSettings.swapServerUrl && rtlStore.nodeSettings.swapServerUrl.trim() !== '') ? true : false;
    });
  }

  goToChannels() {
    this.router.navigateByUrl('/lnd/peerschannels');
  }

  onLoopOut(channel: Channel) {
    this.store.dispatch(new RTLActions.OpenAlert({ data: {
      channel: channel,
      direction: SwapTypeEnum.WITHDRAWAL,
      component: LoopModalComponent
    }}));
  }  

  ngOnDestroy() {
    this.unSubs.forEach(completeSub => {
      completeSub.next();
      completeSub.complete();
    });
  }

}
