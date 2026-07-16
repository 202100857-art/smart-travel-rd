import { TestBed } from '@angular/core/testing';

import { AudioGuide } from './audio-guide';

describe('AudioGuide', () => {
  let service: AudioGuide;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioGuide);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
