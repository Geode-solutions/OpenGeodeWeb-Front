import brep from '@/assets/img/geode_objects/BRep.svg'
import cross_section from '@/assets/img/geode_objects/cross_section.svg'
import edged_curve2d from '@/assets/img/geode_objects/edged_curve2d.svg'
import edged_curve3d from '@/assets/img/geode_objects/edged_curve3d.svg'
import edged_curve from '@/assets/img/geode_objects/edged_curve.svg'
import hybrid_solid from '@/assets/img/geode_objects/hybrid_solid.svg'
import point_set2d from '@/assets/img/geode_objects/point_set2d.svg'
import point_set3d from '@/assets/img/geode_objects/point_set3d.svg'
import polygonal_surface2d from '@/assets/img/geode_objects/polygonal_surface2d.svg'
import polygonal_surface3d from '@/assets/img/geode_objects/polygonal_surface3d.svg'
import polyhedral_solid from '@/assets/img/geode_objects/polyhedral_solid.svg'
import regular_grid3d from '@/assets/img/geode_objects/regular_grid3d.svg'
import regular_grid2d from '@/assets/img/geode_objects/regular_grid2d.svg'
import section from '@/assets/img/geode_objects/section.svg'
import structural_model from '@/assets/img/geode_objects/structural_model.svg'
import tetrahedral_solid from '@/assets/img/geode_objects/tetrahedral_solid.svg'
import triangulated_surface2d from '@/assets/img/geode_objects/triangulated_surface2d.svg'
import triangulated_surface3d from '@/assets/img/geode_objects/triangulated_surface3d.svg'
import vertex_set from '@/assets/img/geode_objects/vertex_set.svg'

const geode_objects = {
    BRep: {
        tooltip: 'BRep',
        image: brep,
    },
    CrossSection: {
        tooltip: 'CrossSection',
        image: cross_section,
    },
    EdgedCurve2D: {
        tooltip: 'EdgedCurve2D',
        image: edged_curve2d,
    },
    EdgedCurve3D: {
        tooltip: 'EdgedCurve3D',
        image: edged_curve3d,
    },
    Graph: {
        tooltip: 'Graph',
        image: edged_curve,
    },
    HybridSolid3D: {
        tooltip: "HybridSolid3D",
        image: hybrid_solid,
    },
    PointSet2D: {
        tooltip: 'PointSet2D',
        image: point_set2d,
    },
    PointSet3D: {
        tooltip: 'PointSet3D',
        image: point_set3d,
    },
    PolygonalSurface2D: {
        tooltip: 'PolygonalSurface2D',
        image: polygonal_surface2d,
    },
    PolygonalSurface3D: {
        tooltip: 'PolygonalSurface3D',
        image: polygonal_surface3d,
    },
    PolyhedralSolid3D: {
        tooltip: 'PolyhedralSolid3D',
        image: polyhedral_solid,
    },
    RegularGrid3D: {
        tooltip: 'RegularGrid3D',
        image: regular_grid3d,
    },
    RegularGrid2D: {
        tooltip: 'RegularGrid2D',
        image: regular_grid2d,
    },
    Section: {
        tooltip: 'Section',
        image: section,
    },
    StructuralModel: {
        tooltip: 'StructuralModel',
        image: structural_model,
    },
    TetrahedralSolid3D: {
        tooltip: 'TetrahedralSolid3D',
        image: tetrahedral_solid,
    },
    TriangulatedSurface2D: {
        tooltip: 'TriangulatedSurface2D',
        image: triangulated_surface2d,
    },
    TriangulatedSurface3D: {
        tooltip: 'TriangulatedSurface3D',
        image: triangulated_surface3d,
    },
    VertexSet: {
        tooltip: 'VertexSet',
        image: vertex_set,
    }
}

export default geode_objects
