import test from 'node:test';
import assert from 'node:assert/strict';
import {HOMEPAGE_WHATSAPP_MESSAGE,homepageWhatsAppDestination,homepageWhatsAppUrl,shouldShowHomepageWhatsApp} from './homepageWhatsApp.js';

test('floating WhatsApp is visible only at the top of the homepage',()=>{
  assert.equal(shouldShowHomepageWhatsApp('/',0),true);
  assert.equal(shouldShowHomepageWhatsApp('/',2),true);
  assert.equal(shouldShowHomepageWhatsApp('/',3),false);
  for(const path of ['/parent-enquiry','/teacher-registration','/teachers','/contact','/admin','/how-it-works']){
    assert.equal(shouldShowHomepageWhatsApp(path,0),false,path);
  }
});

test('floating WhatsApp link uses the configured recipient and encodes the prefilled message',()=>{
  const url=homepageWhatsAppUrl('+91 95327 61193');
  assert.match(url,/^https:\/\/wa\.me\/919532761193\?text=/);
  assert.equal(new URL(url).searchParams.get('text'),HOMEPAGE_WHATSAPP_MESSAGE);
  assert.equal(homepageWhatsAppUrl('invalid-number'),'');
  assert.equal(homepageWhatsAppUrl(''),'');
});

test('mobile WhatsApp click uses one same-tab universal link for app handoff and browser fallback',()=>{
  for (const userAgent of ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)','Mozilla/5.0 (Linux; Android 15)']) {
    const destination=homepageWhatsAppDestination('+91 95327 61193',{userAgent});
    assert.equal(destination.target,'_self');
    assert.equal(destination.href,homepageWhatsAppUrl('+91 95327 61193'));
    assert.equal(new URL(destination.href).searchParams.get('text'),HOMEPAGE_WHATSAPP_MESSAGE);
  }
});

test('desktop opens exactly one direct WhatsApp Web compose URL with the configured number and existing message',()=>{
  const destination=homepageWhatsAppDestination('+91 95327 61193',{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'});
  const url=new URL(destination.href);
  assert.equal(destination.target,'_blank');
  assert.equal(url.origin,'https://web.whatsapp.com');
  assert.equal(url.pathname,'/send');
  assert.equal(url.searchParams.get('phone'),'919532761193');
  assert.equal(url.searchParams.get('text'),HOMEPAGE_WHATSAPP_MESSAGE);
  assert.match(url.search,/text=Hi%20TutorAtHome%2C%20I%20would%20like%20to%20enquire%20about%20your%20tutoring%20services\./);
});

test('iPadOS touch devices use the mobile universal link and invalid contacts do not create a URL',()=>{
  const ipad=homepageWhatsAppDestination('+91 95327 61193',{userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',maxTouchPoints:5});
  assert.equal(ipad.target,'_self');
  assert.match(ipad.href,/^https:\/\/wa\.me\//);
  assert.deepEqual(homepageWhatsAppDestination('invalid',{userAgent:'desktop'}),{href:'',target:'_blank'});
});
