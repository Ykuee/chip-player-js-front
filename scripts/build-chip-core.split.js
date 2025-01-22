console.log(
  'Warning! This is an experimental script to build "side modules" with Emscripten.\n' +
  'It is not working yet.\n'
);

const {spawn, execSync} = require('child_process');
var fs = require('fs');
const paths = require('../config/paths');

/**
 * Compile the C libraries with emscripten.
 */
var empp = process.env.EMPP_BIN || 'em++';
var wasm_dir = paths.appPublic;

emccModules = [
  {
    outputFile: 'core',
    mainModule: true,
    sourceFiles: [
      'tinysoundfont/showcqtbar.c',
    ],
    exportedFunctions: [
      // From showcqtbar.c
      '_cqt_init',
      '_cqt_calc',
      '_cqt_render_line',
      '_cqt_bin_to_freq',
      '_calloc',
      '_memcmp',
      '_strncpy',
      '_snprintf',
      '_vsnprintf',
      '_strncmp',
      '_isprint',
      '_strlen',
      '_realloc',
      '_memset',
      '_malloc',
      '_memcpy',
      '_rand',
      '_llvm_round_f64',
    ],
    flags: [],
  },
  {
    outputFile: 'gme',
    mainModule: false,
    sourceFiles: [
      'Ay_Apu.cpp',
      'Ay_Core.cpp',
      'Ay_Cpu.cpp',
      'Ay_Emu.cpp',
      'blargg_common.cpp',
      'blargg_errors.cpp',
      'Blip_Buffer.cpp',
      'Bml_Parser.cpp',
      'c140.c',
      'C140_Emu.cpp',
      'Classic_Emu.cpp',
      'dac_control.c',
      'Data_Reader.cpp',
      'dbopl.cpp',
      'Downsampler.cpp',
      'Dual_Resampler.cpp',
      'Effects_Buffer.cpp',
      'Fir_Resampler.cpp',
      'fm.c',
      'fm2612.c',
      'fmopl.cpp',
      'Gb_Apu.cpp',
      'Gb_Cpu.cpp',
      'Gb_Oscs.cpp',
      'Gbs_Core.cpp',
      'Gbs_Cpu.cpp',
      'Gbs_Emu.cpp',
      'gme.cpp',
      'Gme_File.cpp',
      'Gme_Loader.cpp',
      'Gym_Emu.cpp',
      'Hes_Apu.cpp',
      'Hes_Apu_Adpcm.cpp',
      'Hes_Core.cpp',
      'Hes_Cpu.cpp',
      'Hes_Emu.cpp',
      'higan/dsp/dsp.cpp',
      'higan/dsp/SPC_DSP.cpp',
      'higan/processor/spc700/spc700.cpp',
      'higan/smp/memory.cpp',
      'higan/smp/smp.cpp',
      'higan/smp/timing.cpp',
      'k051649.c',
      'K051649_Emu.cpp',
      'k053260.c',
      'K053260_Emu.cpp',
      'k054539.c',
      'K054539_Emu.cpp',
      'Kss_Core.cpp',
      'Kss_Cpu.cpp',
      'Kss_Emu.cpp',
      'Kss_Scc_Apu.cpp',
      'M3u_Playlist.cpp',
      'Multi_Buffer.cpp',
      'Music_Emu.cpp',
      'Nes_Apu.cpp',
      'Nes_Cpu.cpp',
      'Nes_Fds_Apu.cpp',
      'Nes_Fme7_Apu.cpp',
      'Nes_Namco_Apu.cpp',
      'Nes_Oscs.cpp',
      'Nes_Vrc6_Apu.cpp',
      'Nes_Vrc7_Apu.cpp',
      'Nsf_Core.cpp',
      'Nsf_Cpu.cpp',
      'Nsf_Emu.cpp',
      'Nsf_Impl.cpp',
      'Nsfe_Emu.cpp',
      'okim6258.c',
      'Okim6258_Emu.cpp',
      'okim6295.c',
      'Okim6295_Emu.cpp',
      'Opl_Apu.cpp',
      'pwm.c',
      'Pwm_Emu.cpp',
      'qmix.c',
      'Qsound_Apu.cpp',
      'Resampler.cpp',
      'Rf5C164_Emu.cpp',
      'rf5c68.c',
      'Rf5C68_Emu.cpp',
      'Rom_Data.cpp',
      'Sap_Apu.cpp',
      'Sap_Core.cpp',
      'Sap_Cpu.cpp',
      'Sap_Emu.cpp',
      'scd_pcm.c',
      'segapcm.c',
      'SegaPcm_Emu.cpp',
      'Sgc_Core.cpp',
      'Sgc_Cpu.cpp',
      'Sgc_Emu.cpp',
      'Sgc_Impl.cpp',
      'Sms_Apu.cpp',
      'Sms_Fm_Apu.cpp',
      'Spc_Emu.cpp',
      'Spc_Filter.cpp',
      'Spc_Sfm.cpp',
      'Track_Filter.cpp',
      'Upsampler.cpp',
      'Vgm_Core.cpp',
      'Vgm_Emu.cpp',
      'ym2151.c',
      'Ym2151_Emu.cpp',
      'Ym2203_Emu.cpp',
      'ym2413.c',
      'Ym2413_Emu.cpp',
      'Ym2608_Emu.cpp',
      'Ym2610b_Emu.cpp',
      'Ym2612_Emu.cpp',
      // 'Ym2612_Emu_MAME.cpp',
      // 'Ym2612_Emu_Gens.cpp',
      'Ym3812_Emu.cpp',
      'ymdeltat.cpp',
      'Ymf262_Emu.cpp',
      'ymz280b.c',
      'Ymz280b_Emu.cpp',
      'Z80_Cpu.cpp',
    ].map(file => './game-music-emu/gme/' + file),
    exportedFunctions: [
      '_gme_open_data',
      '_gme_play',
      '_gme_delete',
      '_gme_mute_voices',
      '_gme_track_count',
      '_gme_track_ended',
      '_gme_voice_count',
      '_gme_track_info',
      '_gme_start_track',
      '_gme_open_data',
      '_gme_ignore_silence',
      '_gme_set_tempo',
      '_gme_seek_scaled',
      '_gme_tell_scaled',
      '_gme_set_fade',
      '_gme_voice_name',
    ],
    flags: [
      '-s', 'USE_ZLIB=1',
      // '-DVGM_YM2612_NUKED=1', // slow but very accurate
      // '-DVGM_YM2612_GENS=1',  // very fast but inaccurate
      '-DVGM_YM2612_MAME=1',     // fast and accurate, but suffers on some GYM files
      '-DHAVE_ZLIB_H',
      '-DHAVE_STDINT_H',
    ],
  },
  {
    outputFile: 'xmp',
    mainModule: false,
    sourceFiles: [
      'libxmp/libxmp-lite-stagedir/lib/libxmp-lite.a'
    ],
    exportedFunctions: [
      '_xmp_create_context',
      '_xmp_start_player',
      '_xmp_play_buffer',
      '_xmp_get_frame_info',
      '_xmp_end_player',
      '_xmp_inject_event',
      '_xmp_get_module_info',
      '_xmp_get_format_list',
      '_xmp_stop_module',
      '_xmp_restart_module',
      '_xmp_seek_time',
      '_xmp_channel_mute',
      '_xmp_get_player',
      '_xmp_load_module_from_memory',
      '_llvm_round_f64',
    ],
    flags: [],
  },
  {
    outputFile: 'midi',
    mainModule: false,
    sourceFiles: [
      'fluidlite2/build/libfluidlite.a',
      'tinysoundfont/tinyplayer.c',
    ],
    exportedFunctions: [
      '_new_fluid_settings',
      '_new_fluid_synth',
      '_fluid_settings_setint',
      '_fluid_settings_setnum',
      '_fluid_settings_setstr',
      '_fluid_synth_sfload',
      '_fluid_synth_noteon',
      '_fluid_synth_noteoff',
      '_fluid_synth_all_notes_off',
      '_fluid_synth_all_sounds_off',
      '_fluid_synth_write_float',
      '_fluid_synth_set_reverb',
      '_tp_write_audio',
      '_tp_open',
      '_tp_init',
      '_tp_load_soundfont',
      '_tp_stop',
      '_tp_seek',
      '_tp_set_speed',
      '_tp_get_duration_ms',
      '_tp_get_position_ms',
      '_tp_set_reverb',
      '_tp_get_channel_in_use',
      '_tp_get_channel_program',
      '_tp_set_channel_mute',
      '_llvm_round_f64',
    ],
    flags: [],
  },
];

var runtime_methods = [
  'ALLOC_NORMAL',
  'FS',
  'UTF8ToString',
  'allocate',
  'ccall',
  'getValue',
  'setValue',
  'loadDynamicLibrary',
];

var baseFlags = [
  '-s', 'ALLOW_MEMORY_GROWTH=1',
  '-s', 'ASSERTIONS=1',
  '-s', 'ENVIRONMENT=web',
  '-O0',
  // '--closure', '1',
  // '--llvm-lto', '3',

  '-Qunused-arguments',
  '-Wno-deprecated',
  '-Wno-logical-op-parentheses',
  '-Wno-c++11-extensions',
  '-Wno-inconsistent-missing-override',
  '-Wno-c++11-narrowing',
  // '-fno-exceptions',
  '-std=c++11',
];

var env = Object.create(process.env);
env.EMCC_FORCE_STDLIBS = '1';
console.log('ENVIRONMENT:', env);

emccModules.forEach(module => {
  var wasmFile = 'src/' + module.outputFile + '.wasm';
  var jsFile = 'src/' + module.outputFile + '.js';
  var args = [].concat(
    ['-s', 'EXPORTED_FUNCTIONS=[' + module.exportedFunctions.join(',') + ']'],
    baseFlags,
    module.flags,
    module.sourceFiles,
  );

  if (module.mainModule) {
    args = args.concat([
      '-o', jsFile,
      // '-v',
      '-s', 'PGO=1',
      // '-s', 'EXPORT_ALL=1',
      '-s', 'MAIN_MODULE=2',
      '-s', 'MODULARIZE=1',
      '-s', 'EXPORT_NAME=CHIP_CORE',
      '-s', 'EXPORTED_RUNTIME_METHODS=[' + runtime_methods.join(',') + ']',
    ]);
  } else {
    args = args.concat([
      '-o', wasmFile,
      // '-s', 'EXPORT_ALL=1',
      '-s', 'SIDE_MODULE=2',
    ]);
  }

  console.log('Compiling to %s...', wasmFile + (module.mainModule ? '+' + jsFile : ''));
  var build_proc = spawn(empp, args, {env: env, stdio: 'inherit'});
  build_proc.on('exit', function (code) {
    console.log('...done compiling %s', wasmFile);
    if (code === 0) {
      console.log('Moving %s to %s.', wasmFile, wasm_dir);
      execSync(`mv ${wasmFile} ${wasm_dir}`);

      if (module.mainModule) {
        // Don't use --pre-js because it can get stripped out by closure.
        const eslint_disable = '/*eslint-disable*/\n';
        console.log('Prepending %s with %s.', jsFile, eslint_disable.trim());
        const data = fs.readFileSync(jsFile);
        const fd = fs.openSync(jsFile, 'w+');
        const insert = new Buffer(eslint_disable);
        fs.writeSync(fd, insert, 0, insert.length, 0);
        fs.writeSync(fd, data, 0, data.length, insert.length);
        fs.close(fd, (err) => {
          if (err) throw err;
        });
      }
    }
  });
});
