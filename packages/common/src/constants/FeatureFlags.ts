export const FeatureFlags = {
  Client: {
    Menu: {
      Social: 'ir.client.menu.social',
      Emote: 'ir.client.menu.emote',
      Avaturn: 'ir.client.menu.avaturn',
      ReadyPlayerMe: 'ir.client.menu.readyPlayerMe',
      CreateAvatar: 'ir.client.menu.createAvatar',
      UploadAvatar: 'ir.client.menu.uploadAvatar',
      MotionCapture: 'ir.client.location.menu.motionCapture',
      XR: 'ir.client.menu.xr',
      ShareToQuest: 'ir.client.menu.shareToQuest'
    },
    Glass: 'ir.client.glass'
  },
  Studio: {
    Model: {
      Dereference: 'ir.studio.model.dereference'
    },
    Components: {
      LegacyVolumetric: 'ir.studio.components.legacyVolumetric',
      Volumetric: 'ir.studio.components.volumetric',
      AudioAnalysis: 'ir.studio.components.audioAnalysis',
      ScreenshareTarget: 'ir.studio.components.screenshareTarget',
      Spline: 'ir.studio.components.spline'
    },
    Panel: {
      Script: 'ir.editor.panel.script',
      VisualScript: 'ir.editor.panel.visualScript',
      Portal: 'ir.editor.panel.portal',
      Grabble: 'ir.editor.panel.grabble'
    },
    UI: {
      SceneComplexityNotification: 'ir.editor.ui.sceneComplexityNotification',
      TransformPivot: 'ir.editor.ui.transformPivot',
      Hierarchy: {
        ShowGlbChildren: 'ir.editor.ui.hierarchy.showGlbChildren'
      },
      PointClick: 'ir.editor.ui.pointClick',
      CompressOnPublish: 'ir.editor.ui.compressOnPublish'
    }
  }
}
