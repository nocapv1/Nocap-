import bpy, sys
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath="walk.fbx")
arms=[o for o in bpy.data.objects if o.type=='ARMATURE']
print("RESULT armatures:", len(arms))
for a in arms:
    print("RESULT bones:", len(a.data.bones), [b.name for b in a.data.bones][:6])
    act=a.animation_data.action if a.animation_data else None
    print("RESULT action:", act.name if act else None, "frames", tuple(act.frame_range) if act else None, "fcurves", len(act.fcurves) if act else 0)
    sc=bpy.context.scene; sc.frame_set(30)
    print("RESULT hips@30:", tuple(round(v,3) for v in a.pose.bones['Hips'].matrix.translation), "head@30:", tuple(round(v,3) for v in (a.matrix_world @ a.pose.bones['Head'].head)))
