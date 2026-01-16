import { useConfigStore } from '../store/useConfigStore';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function Configurator() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'mod' | 'game'>('mod');
  const {
    // Mod Settings
    skyBrightness,
    bloomIntensity,
    volumetricFog,
    recoilShake,
    bulletTracers,
    ragdollPhysics,
    setSkyBrightness,
    setBloomIntensity,
    setRecoilShake,
    toggleVolumetricFog,
    toggleBulletTracers,
    toggleRagdollPhysics,
    
    // GTA Settings (State)
    resolution, refreshRate, screenType, vsync,
    textureQuality, shaderQuality, shadowQualityGame, reflectionQuality, waterQuality, particlesQuality, grassQuality, postFX, tessellation,
    softShadows, shadowDistance, highResShadows, longShadows, particleShadows, disableShadowSizeCheck,
    pedVarietyMultiplier, vehicleVarietyMultiplier, lodScale, maxLodScale, motionBlurStrength, cityDensity, reflectionMipBlur, fogVolumes, highDetailStreaming,
    fxaa, msaa, txaa, anisotropicFiltering,
    distanceScaling, extendedDistanceScaling, populationDensity, populationVariety,
    
    // Actions
    setGtaValue,
    resetDefaults,
    applyConfig,
    isApplying
  } = useConfigStore();

  return (
    <div id="configurator" className="tab-content max-w-4xl mx-auto animate-fade-in">
      {/* Header with Sub-tabs switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('configurator.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('configurator.subtitle')}</p>
        </div>
        
        {/* Sub-tabs Switcher */}
        <div className="flex p-1 bg-gray-200 dark:bg-white/5 rounded-lg self-stretch md:self-auto">
          <button 
            onClick={() => setActiveTab('mod')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === 'mod' 
                ? 'bg-white dark:bg-app-accent text-black shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('configurator.tabMod')}
          </button>
          <button 
            onClick={() => setActiveTab('game')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === 'game' 
                ? 'bg-white dark:bg-app-accent text-black shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('configurator.tabGame')}
          </button>
        </div>
      </div>

      {/* --- SUB-TAB: MOD CONFIG --- */}
      <div className={activeTab === 'mod' ? 'animate-fade-in' : 'hidden'}>
        <div className="flex justify-end gap-3 mb-6">
          <button 
            onClick={resetDefaults}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
          >{t('configurator.reset')}</button>
          <button 
            onClick={applyConfig}
            disabled={isApplying}
            className="btn-accent bg-app-accent text-black px-6 py-2 rounded-lg font-bold text-sm shadow-neon-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isApplying ? <i className="ph-bold ph-spinner animate-spin"></i> : <i className="ph-bold ph-check"></i>}
            {t('configurator.saveModConfig')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Visual Settings */}
          <div className="bg-white dark:bg-app-surface p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <i className="ph-bold ph-eye"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('configurator.visuals')}</h3>
            </div>

            {/* Range Slider: Sky */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('configurator.skyBrightness')}</label>
                <span className="text-sm font-bold text-gray-900 dark:text-app-accent" id="val-sky">{skyBrightness}%</span>
              </div>
              <input 
                type="range" 
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                min="0" 
                max="100" 
                value={skyBrightness}
                onChange={(e) => setSkyBrightness(parseInt(e.target.value))}
              />
            </div>

            {/* Range Slider: Bloom */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('configurator.bloomIntensity')}</label>
                <span className="text-sm font-bold text-gray-900 dark:text-app-accent" id="val-bloom">{bloomIntensity}%</span>
              </div>
              <input 
                type="range" 
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                min="0" 
                max="100" 
                value={bloomIntensity}
                onChange={(e) => setBloomIntensity(parseInt(e.target.value))}
              />
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-white/5">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('configurator.volumetricFog')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{t('configurator.fogHint')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={volumetricFog}
                  onChange={toggleVolumetricFog}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-app-accent"></div>
              </label>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div className="bg-white dark:bg-app-surface p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                <i className="ph-bold ph-crosshair"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('configurator.gameplay')}</h3>
            </div>

            {/* Range Slider: Recoil */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('configurator.recoilShake')}</label>
                <span className="text-sm font-bold text-gray-900 dark:text-app-accent" id="val-recoil">{recoilShake}%</span>
              </div>
              <input 
                type="range" 
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                min="0" 
                max="100" 
                value={recoilShake}
                onChange={(e) => setRecoilShake(parseInt(e.target.value))}
              />
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('configurator.bulletTracers')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{t('configurator.tracersHint')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={bulletTracers}
                  onChange={toggleBulletTracers}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-app-accent"></div>
              </label>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-white/5">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('configurator.ragdoll')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{t('configurator.ragdollHint')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={ragdollPhysics}
                  onChange={toggleRagdollPhysics}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-app-accent"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* --- SUB-TAB: GTA V SETTINGS --- */}
      <div className={activeTab === 'game' ? 'animate-fade-in' : 'hidden'}>
        
        {/* VRAM Usage Bar */}
        <div className="bg-white dark:bg-app-surface p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg dark:shadow-none mb-8">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="ph-bold ph-monitor-play"></i> {t('configurator.videoMemory')}
              </h3>
              <p className="text-xs text-gray-500">NVIDIA GeForce RTX 5060</p>
            </div>
            <span className="text-sm font-mono font-bold text-gray-900 dark:text-app-accent">2450 MB / 8192 MB</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
            <div className="h-full bg-app-accent w-[30%] shadow-[0_0_10px_rgba(204,255,0,0.5)]"></div>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* 1. Display Settings */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="ph-bold ph-desktop"></i> {t('configurator.display')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t('configurator.resolution'), val: resolution, key: 'resolution', opts: ['1920x1080', '2560x1440', '3840x2160'] },
                { label: t('configurator.refreshRate'), val: refreshRate, key: 'refreshRate', opts: ['60 Hz', '144 Hz', '179 Hz'] },
                { label: t('configurator.screenType'), val: screenType, key: 'screenType', opts: [{l:t('configurator.common.fullscreen'),v:'0'}, {l:t('configurator.common.windowed'),v:'1'}, {l:t('configurator.common.borderless'),v:'2'}] },
                { label: t('configurator.vsync'), val: vsync, key: 'vsync', opts: [{l:t('configurator.common.off'),v:'0'}, {l:t('configurator.common.on'),v:'1'}] }
              ].map((item: any) => (
                <div key={item.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{item.label}</label>
                  <select 
                    value={item.val}
                    onChange={(e) => setGtaValue(item.key, e.target.value)}
                    className="w-full bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-app-accent cursor-pointer"
                  >
                    {item.opts.map((opt: any) => (
                      <option key={opt.v || opt} value={opt.v || opt}>{opt.l || opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Graphics Quality */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="ph-bold ph-image"></i> {t('configurator.graphicsQuality')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white dark:bg-app-surface p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
              {[
                { label: t('configurator.textureQuality'), val: textureQuality, key: 'textureQuality' },
                { label: t('configurator.shaderQuality'), val: shaderQuality, key: 'shaderQuality' },
                { label: t('configurator.reflectionQuality'), val: reflectionQuality, key: 'reflectionQuality', extra: [t('configurator.common.ultra')] },
                { label: t('configurator.waterQuality'), val: waterQuality, key: 'waterQuality' },
                { label: t('configurator.particles'), val: particlesQuality, key: 'particlesQuality' },
                { label: t('configurator.grassQuality'), val: grassQuality, key: 'grassQuality', extra: [t('configurator.common.ultra')] },
                { label: t('configurator.postFX'), val: postFX, key: 'postFX', extra: [t('configurator.common.ultra')] },
                { label: t('configurator.tessellation'), val: tessellation, key: 'tessellation', extra: [t('configurator.common.veryHigh')], off: true }
              ].map((item: any) => (
                <div key={item.key}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{item.label}</label>
                  <select 
                    value={item.val}
                    onChange={(e) => setGtaValue(item.key, e.target.value)}
                    className="w-full bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-app-accent cursor-pointer"
                  >
                    {item.off && <option value="0">{t('configurator.common.off')}</option>}
                    <option value={item.off ? "1" : "0"}>{t('configurator.common.normal')}</option>
                    <option value={item.off ? "2" : "1"}>{t('configurator.common.high')}</option>
                    <option value={item.off ? "3" : "2"}>{t('configurator.common.veryHigh')}</option>
                    {item.extra?.map((ex: string, i: number) => <option key={ex} value={item.off ? 4+i : 3+i}>{ex}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Shadows & Lighting */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="ph-bold ph-sun"></i> {t('configurator.shadowsLighting')}
            </h3>
            <div className="bg-white dark:bg-app-surface p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Shadow Quality */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('configurator.shadowQuality')}</label>
                  <select 
                    value={shadowQualityGame}
                    onChange={(e) => setGtaValue('shadowQualityGame', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-app-accent cursor-pointer"
                  >
                    <option value="0" className="text-red-500 font-bold">{t('configurator.common.off')} (0)</option>
                    <option value="1">{t('configurator.common.normal')} (1)</option>
                    <option value="2">{t('configurator.common.high')} (2)</option>
                    <option value="3">{t('configurator.common.veryHigh')} (3)</option>
                  </select>
                </div>

                {/* Soft Shadows */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('configurator.softShadows')}</label>
                  <select 
                    value={softShadows}
                    onChange={(e) => setGtaValue('softShadows', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-app-accent cursor-pointer"
                  >
                    <option value="0">{t('configurator.common.sharp')}</option>
                    <option value="1">{t('configurator.common.soft')}</option>
                    <option value="2">{t('configurator.common.softer')}</option>
                    <option value="3">{t('configurator.common.pcss')}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('configurator.shadowDistance')}</label>
                    <span className="text-sm font-bold text-gray-900 dark:text-app-accent">{shadowDistance}</span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                    min="0" max="2" step="0.1" 
                    value={shadowDistance}
                    onChange={(e) => setGtaValue('shadowDistance', parseFloat(e.target.value))}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">{t('configurator.shadows.distanceHint')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-white/5 pt-4">
                {[
                  { l: t('configurator.shadows.highRes'), k: 'highResShadows', v: highResShadows },
                  { l: t('configurator.shadows.long'), k: 'longShadows', v: longShadows },
                  { l: t('configurator.shadows.particle'), k: 'particleShadows', v: particleShadows },
                  { l: t('configurator.shadows.disableSizeCheck'), k: 'disableShadowSizeCheck', v: disableShadowSizeCheck }
                ].map((item: any) => (
                  <div key={item.k} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300" title={item.k === 'disableShadowSizeCheck' ? 'Shadow_DisableScreenSizeCheck' : ''}>{item.l}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={item.v}
                        onChange={() => setGtaValue(item.k, !item.v)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-app-accent"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Deep Engine Tuning */}
          <div className="animate-slide-up">
            <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
              <i className="ph-bold ph-engine"></i> {t('configurator.deepEngine')}
            </h3>
            <div className="bg-white dark:bg-app-surface p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <i className="ph-bold ph-warning-octagon text-9xl"></i>
              </div>
              <p className="text-xs text-gray-500 mb-4 bg-red-500/10 p-3 rounded border border-red-500/20">
                {t('configurator.warningEngine')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pedestrian Variety */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300" title="PedVarietyMultiplier">{t('configurator.engine.pedVariety')}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-app-accent font-mono">{pedVarietyMultiplier}</span>
                    </div>
                    <input 
                      type="range" 
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-red-500" 
                      min="-10" max="10" step="0.1" 
                      value={pedVarietyMultiplier}
                      onChange={(e) => setGtaValue('pedVarietyMultiplier', parseFloat(e.target.value))}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                        <span className="text-app-accent">{t('configurator.engine.pedVarietyPos')}</span> {t('configurator.engine.pedVarietyPosDesc')}<br/>
                        <span className="text-red-400">{t('configurator.engine.pedVarietyNeg')}</span> {t('configurator.engine.pedVarietyNegDesc')}
                    </p>
                  </div>

                  {/* Vehicle Variety */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300" title="VehicleVarietyMultiplier">{t('configurator.engine.vehicleVariety')}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-app-accent font-mono">{vehicleVarietyMultiplier}</span>
                    </div>
                    <input 
                      type="range" 
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-red-500" 
                      min="-10" max="10" step="0.1" 
                      value={vehicleVarietyMultiplier}
                      onChange={(e) => setGtaValue('vehicleVarietyMultiplier', parseFloat(e.target.value))}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                        {t('configurator.engine.vehicleVarietyHint')} <br/>
                        <strong className="text-white">{t('configurator.engine.vehicleVarietyLower')}</strong> {t('configurator.engine.vehicleVarietyLowerDesc')}
                    </p>
                  </div>

                  {/* LOD Scale */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300" title="LodScale">{t('configurator.engine.lodScale')}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-app-accent font-mono">{lodScale}</span>
                    </div>
                    <input 
                      type="range" 
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                      min="0" max="5" step="0.1" 
                      value={lodScale}
                      onChange={(e) => setGtaValue('lodScale', parseFloat(e.target.value))}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                        {t('configurator.engine.lodScaleHint')} <br/>
                        <strong className="text-white">{t('configurator.engine.lodScaleHigh')}</strong> {t('configurator.engine.lodScaleHighDesc')} <br/>
                        <strong className="text-white">{t('configurator.engine.lodScaleLow')}</strong> {t('configurator.engine.lodScaleLowDesc')}
                    </p>
                  </div>

                  {/* Max LOD Scale */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300" title="MaxLodScale">{t('configurator.engine.maxLodScale')}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-app-accent font-mono">{maxLodScale}</span>
                    </div>
                    <input 
                      type="range" 
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                      min="-2" max="2" step="0.1" 
                      value={maxLodScale}
                      onChange={(e) => setGtaValue('maxLodScale', parseFloat(e.target.value))}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                        {t('configurator.engine.maxLodScaleHint1')} <br/>
                        {t('configurator.engine.maxLodScaleHint2')}
                    </p>
                  </div>

                  {/* Motion Blur */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('configurator.engine.motionBlur')}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-app-accent font-mono">{motionBlurStrength}</span>
                    </div>
                    <input 
                      type="range" 
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                      min="0" max="1" step="0.01" 
                      value={motionBlurStrength}
                      onChange={(e) => setGtaValue('motionBlurStrength', parseFloat(e.target.value))}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                        {t('configurator.engine.motionBlurHint')} <strong className="text-white">{t('configurator.engine.motionBlurHintVal')}</strong> {t('configurator.engine.motionBlurHintDesc')}
                    </p>
                  </div>

                  {/* City Density */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('configurator.engine.cityDensity')}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-app-accent font-mono">{cityDensity}</span>
                    </div>
                    <input 
                      type="range" 
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                      min="0" max="3" step="0.1" 
                      value={cityDensity}
                      onChange={(e) => setGtaValue('cityDensity', parseFloat(e.target.value))}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                        {t('configurator.engine.cityDensityHint1')} <br/>
                        {t('configurator.engine.cityDensityHint2')}
                    </p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-white/5 pt-4 mt-2">
                  {/* Reflection MipBlur */}
                  <div className="flex items-center justify-between group relative">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium" title="Reflection_MipBlur">{t('configurator.engine.reflectionMipBlur')}</span>
                        <span className="text-[10px] text-gray-500 max-w-[200px]">{t('configurator.engine.reflectionMipBlurHint')}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={reflectionMipBlur}
                        onChange={() => setGtaValue('reflectionMipBlur', !reflectionMipBlur)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-app-accent"></div>
                    </label>
                  </div>

                  {/* Fog Volumes */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium" title="Lighting_FogVolumes">{t('configurator.engine.fogVolumes')}</span>
                        <span className="text-[10px] text-gray-500 max-w-[200px]">{t('configurator.engine.fogVolumesHint')}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={fogVolumes}
                        onChange={() => setGtaValue('fogVolumes', !fogVolumes)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-app-accent"></div>
                    </label>
                  </div>

                  {/* High Detail Streaming */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium" title="HdStreamingInFlight">{t('configurator.engine.highDetailStreaming')}</span>
                        <span className="text-[10px] text-gray-500 max-w-[200px]">{t('configurator.engine.highDetailStreamingHint')}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={highDetailStreaming}
                        onChange={() => setGtaValue('highDetailStreaming', !highDetailStreaming)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-app-accent"></div>
                    </label>
                  </div>
              </div>
            </div>
          </div>

          {/* 5. Anti-Aliasing */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="ph-bold ph-magic-wand"></i> {t('configurator.antiAliasing')}
            </h3>
            <div className="bg-white dark:bg-app-surface p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { l: 'FXAA', k: 'fxaa', v: fxaa, opts: [{l:t('configurator.common.off'),v:'0'}, {l:t('configurator.common.on'),v:'1'}] },
                { l: 'MSAA', k: 'msaa', v: msaa, opts: [{l:t('configurator.common.off'),v:'0'}, {l:'X2',v:'2'}, {l:'X4',v:'4'}, {l:'X8',v:'8'}] },
                { l: 'TXAA', k: 'txaa', v: txaa, opts: [{l:t('configurator.common.off'),v:'0'}, {l:t('configurator.common.on'),v:'1'}], disabled: true },
                { l: 'Anisotropic Filtering', k: 'anisotropicFiltering', v: anisotropicFiltering, opts: [{l:t('configurator.common.off'),v:'0'}, {l:'X2',v:'2'}, {l:'X4',v:'4'}, {l:'X8',v:'8'}, {l:'X16',v:'16'}] }
              ].map((item: any) => (
                <div key={item.k}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{item.l}</label>
                  <select 
                    value={item.v}
                    onChange={(e) => setGtaValue(item.k, e.target.value)}
                    disabled={item.disabled}
                    className="w-full bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-app-accent cursor-pointer disabled:opacity-50"
                  >
                    {item.opts.map((opt: any) => (
                      <option key={opt.v} value={opt.v}>{opt.l}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Distance & Scaling */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="ph-bold ph-ruler"></i> {t('configurator.distanceScaling')}
            </h3>
            <div className="bg-white dark:bg-app-surface p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm space-y-6">
              {[
                { l: t('configurator.distance.scaling'), k: 'distanceScaling', v: distanceScaling },
                { l: t('configurator.distance.extendedScaling'), k: 'extendedDistanceScaling', v: extendedDistanceScaling },
              ].map((item: any) => (
                <div key={item.k}>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.l}</label>
                    <span className="text-sm font-bold text-gray-900 dark:text-app-accent">{item.v}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                    min="0" max="100" 
                    value={item.v}
                    onChange={(e) => setGtaValue(item.k, parseInt(e.target.value))}
                  />
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {[
                  { l: t('configurator.distance.popDensity'), k: 'populationDensity', v: populationDensity },
                  { l: t('configurator.distance.popVariety'), k: 'populationVariety', v: populationVariety },
                ].map((item: any) => (
                  <div key={item.k}>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.l}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-app-accent">{item.v}%</span>
                    </div>
                    <input 
                      type="range" 
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-[#CCFF00]" 
                      min="0" max="100" 
                      value={item.v}
                      onChange={(e) => setGtaValue(item.k, parseInt(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8 pb-8">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">
            {t('configurator.discard')}
          </button>
          <button className="btn-accent bg-app-accent text-black px-6 py-2 rounded-lg font-bold text-sm shadow-neon-sm">
            {t('configurator.applyXml')}
          </button>
        </div>
      </div>
    </div>
  );
}
