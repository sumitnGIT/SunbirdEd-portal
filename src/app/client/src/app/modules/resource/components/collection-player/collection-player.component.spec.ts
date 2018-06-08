import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { CollectionPlayerComponent } from './collection-player.component';
import { ContentService, PlayerService, CoreModule, UserService } from '@sunbird/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { WindowScrollService, ConfigService, SharedModule } from '../../../shared';
import {
  ToasterService, ResourceService
} from '@sunbird/shared';
import { SuiModule } from 'ng2-semantic-ui';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import { CollectionHierarchyGetMockResponse, ExtUrlContentResponse } from './collection-player.spec.data';
import { NO_ERRORS_SCHEMA } from '@angular/core';

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('CollectionPlayerComponent', () => {
  let component: CollectionPlayerComponent;
  let fixture: ComponentFixture<CollectionPlayerComponent>;
  const collectionId = 'do_112270591840509952140';
  const contentId = 'domain_44689';

  const playcontentmock = { id: 'do_1125110622654464001294', title: 'A5 ext link' };
  const fakeActivatedRoute = {
    params: Observable.of({ id: collectionId }),
    queryParams: Observable.of({ contentId: contentId }),
    snapshot: {
      data: {
        telemetry: {
          env: 'get', pageid: 'get', type: 'edit', subtype: 'paginate'
        }
      }
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionPlayerComponent],
      imports: [SuiModule, HttpClientTestingModule, CoreModule.forRoot(), SharedModule.forRoot(), RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: ActivatedRoute, useValue: fakeActivatedRoute }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPlayerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.showPlayer).toBeFalsy();
    // expect(component.serviceUnavailable).toBeFalsy();
    expect(component.loader).toBeTruthy();
    expect(component.loaderMessage).toEqual({
      headerMessage: 'Please wait...',
      loaderMessage: 'Fetching content details!'
    });
    expect(component.collectionTreeOptions).toEqual({
      fileIcon: 'fa fa-file-o fa-lg',
      customFileIcon: {
        'video': 'fa fa-file-video-o fa-lg',
        'pdf': 'fa fa-file-pdf-o fa-lg',
        'youtube': 'fa fa-youtube fa-lg fancy_tree_red',
        'H5P': 'fa fa-html5 fa-lg',
        'audio': 'fa fa-file-audio-o fa-lg',
        'ECML': 'fa fa-file-code-o fa-lg',
        'HTML': 'fa fa-html5 fa-lg',
        'collection': 'fa fa-file-archive-o fa-lg',
        'epub': 'fa fa-file-text fa-lg',
        'doc': 'fa fa-file-text fa-lg'
      }
    });
  });

  it('should get content based on route/query params', () => {
    const playerService: PlayerService = TestBed.get(PlayerService);
    const windowScrollService = TestBed.get(WindowScrollService);
    spyOn(windowScrollService, 'smoothScroll');
    spyOn(playerService, 'getCollectionHierarchy').and
      .returnValue(Observable.of(CollectionHierarchyGetMockResponse));
    component.ngOnInit();
    expect(component.collectionTreeNodes).toEqual({ data: CollectionHierarchyGetMockResponse.result.content });
    expect(component.loader).toBeFalsy();
  });

  xit('should navigate to error page on invalid collection id', () => { });
  xit('should navigate to error page on valid collection id but invalid content id', () => { });
  xit('should show service unavailable message on API server error', () => { });

  it('should open preview link in newtab for mimeType x-url',
    inject([Router, ToasterService, ResourceService, PlayerService, WindowScrollService],
      (router, toasterService, resourceService, playerservice, windowScrollService) => {
        component.playContent(playcontentmock);
        spyOn(playerservice, 'getConfigByContent').and.returnValue(Observable.of(ExtUrlContentResponse.playerConfig));
        spyOn(toasterService, 'warning').and.callThrough();
        spyOn(windowScrollService, 'smoothScroll');
        const windowSpy = spyOn(window, 'open');
        windowScrollService.smoothScroll('app-player-collection-renderer');
        window.open('/learn/redirect', '_blank');
        expect(window.open).toHaveBeenCalledWith('/learn/redirect', '_blank');
        expect(windowScrollService.smoothScroll).toHaveBeenCalled();
        expect(toasterService.warning).toBeDefined();
      }));
});
