import unittest
from backend.main import Landmark
from backend.core.classification import calculate_distance, is_finger_extended, classify_mudra

def make_hand(
    ext_thumb=True,
    ext_index=True,
    ext_middle=True,
    ext_ring=True,
    ext_pinky=True,
    idx_tip_x=0.0,
    mid_tip_x=0.0,
    ring_tip_pos=None,
    thumb_tip_pos=None,
):
    """
    Builds a synthetic 21-landmark hand for unit testing.
    Straight fingers have collinear segments pointing along +Y.
    Bent fingers fold back so mcp-to-tip distance is small.
    """
    pts = [Landmark(x=0.0, y=0.0, z=0.0) for _ in range(21)]
    
    # 0: Wrist
    pts[0] = Landmark(x=0.0, y=0.0, z=0.0)

    # 1-4: Thumb
    if ext_thumb:
        pts[1] = Landmark(x=-0.04, y=0.02, z=0.0)
        pts[2] = Landmark(x=-0.06, y=0.05, z=0.0)
        pts[3] = Landmark(x=-0.08, y=0.08, z=0.0)
        pts[4] = Landmark(x=-0.10, y=0.11, z=0.0)
    else:
        pts[1] = Landmark(x=-0.02, y=0.02, z=0.0)
        pts[2] = Landmark(x=-0.01, y=0.03, z=0.0)
        pts[3] = Landmark(x=0.00, y=0.02, z=0.0)
        pts[4] = Landmark(x=0.00, y=0.01, z=0.0)

    # Helper for a 4-joint finger chain
    def set_finger(mcp_idx, base_x, is_ext, tip_override_x=None):
        mcp_y = 0.10
        pts[mcp_idx] = Landmark(x=base_x, y=mcp_y, z=0.0)
        if is_ext:
            # Straight upward in +Y
            pts[mcp_idx + 1] = Landmark(x=base_x, y=mcp_y + 0.04, z=0.0)
            pts[mcp_idx + 2] = Landmark(x=base_x, y=mcp_y + 0.07, z=0.0)
            tx = base_x if tip_override_x is None else tip_override_x
            pts[mcp_idx + 3] = Landmark(x=tx, y=mcp_y + 0.10, z=0.0)
        else:
            # Bent downwards towards palm
            pts[mcp_idx + 1] = Landmark(x=base_x, y=mcp_y + 0.03, z=0.02)
            pts[mcp_idx + 2] = Landmark(x=base_x, y=mcp_y + 0.01, z=0.04)
            pts[mcp_idx + 3] = Landmark(x=base_x, y=mcp_y - 0.01, z=0.02)

    # 5-8: Index
    set_finger(5, base_x=-0.02, is_ext=ext_index, tip_override_x=idx_tip_x if ext_index else None)
    # 9-12: Middle
    set_finger(9, base_x=0.00, is_ext=ext_middle, tip_override_x=mid_tip_x if ext_middle else None)
    # 13-16: Ring
    set_finger(13, base_x=0.02, is_ext=ext_ring)
    # 17-20: Pinky
    set_finger(17, base_x=0.04, is_ext=ext_pinky)

    if ring_tip_pos is not None:
        pts[16] = ring_tip_pos
    if thumb_tip_pos is not None:
        pts[4] = thumb_tip_pos

    return pts

class TestMudraClassification(unittest.TestCase):
    def test_calculate_distance(self):
        p1 = Landmark(x=0.0, y=0.0, z=0.0)
        p2 = Landmark(x=3.0, y=4.0, z=0.0)
        self.assertAlmostEqual(calculate_distance(p1, p2), 5.0)

    def test_is_finger_extended_true(self):
        hand = make_hand(ext_index=True)
        self.assertTrue(is_finger_extended(hand, [5, 6, 7, 8]))

    def test_is_finger_extended_false(self):
        hand = make_hand(ext_index=False)
        self.assertFalse(is_finger_extended(hand, [5, 6, 7, 8]))

    def test_pataka_classification(self):
        # All 4 fingers straight and together
        hand = make_hand(
            ext_index=True, ext_middle=True, ext_ring=True, ext_pinky=True,
            idx_tip_x=-0.01, mid_tip_x=0.0
        )
        # distance idx-mid: 0.01 < 0.05, distance mid-ring: 0.02 < 0.05
        res = classify_mudra(hand, "Right")
        self.assertEqual(res["name"], "Pataka")
        self.assertGreaterEqual(res["confidence"], 0.9)

    def test_tripataka_classification(self):
        # Index, Middle, Pinky straight; Ring bent
        hand = make_hand(
            ext_index=True, ext_middle=True, ext_ring=False, ext_pinky=True
        )
        res = classify_mudra(hand, "Right")
        self.assertEqual(res["name"], "Tripataka")

    def test_mayura_classification(self):
        # Ring touching thumb, index, mid, pinky straight
        hand = make_hand(
            ext_index=True, ext_middle=True, ext_ring=False, ext_pinky=True,
            ring_tip_pos=Landmark(x=-0.05, y=0.05, z=0.0),
            thumb_tip_pos=Landmark(x=-0.05, y=0.05, z=0.0)
        )
        res = classify_mudra(hand, "Right")
        self.assertEqual(res["name"], "Mayura")

    def test_arala_classification(self):
        # Index bent, middle, ring, pinky straight
        hand = make_hand(
            ext_index=False, ext_middle=True, ext_ring=True, ext_pinky=True
        )
        res = classify_mudra(hand, "Right")
        self.assertEqual(res["name"], "Arala")

    def test_shukatunda_classification(self):
        # Index bent, ring bent, middle, pinky straight
        hand = make_hand(
            ext_index=False, ext_middle=True, ext_ring=False, ext_pinky=True
        )
        res = classify_mudra(hand, "Right")
        self.assertEqual(res["name"], "Shukatunda")

    def test_unknown_classification(self):
        # Flat landmarks or invalid pose
        hand = [Landmark(x=0.0, y=0.0, z=0.0) for _ in range(21)]
        res = classify_mudra(hand, "Right")
        self.assertEqual(res["name"], "Unknown")
        self.assertEqual(res["confidence"], 0.0)

    # -------------------------------------------------------------------------
    # REGRESSION TESTS: Disambiguating Kartarimukha and Ardhapataka
    # -------------------------------------------------------------------------
    def test_kartarimukha_distinguished_from_ardhapataka(self):
        """
        REGRESSION TEST:
        Previously, Ardhapataka condition preceded Kartarimukha without checking
        dist_idx_mid, causing Kartarimukha to be completely shadowed/unreachable.
        
        Kartarimukha has index and middle fingers spread in a distinct V-shape
        (dist_idx_mid > 0.08), with ring and pinky bent.
        """
        # Index tip at x = -0.06, Middle tip at x = +0.06 -> dist_idx_mid = 0.12 > 0.08
        kartarimukha_hand = make_hand(
            ext_index=True,
            ext_middle=True,
            ext_ring=False,
            ext_pinky=False,
            idx_tip_x=-0.06,
            mid_tip_x=0.06,
        )
        dist = calculate_distance(kartarimukha_hand[8], kartarimukha_hand[12])
        self.assertGreater(dist, 0.08, f"Expected V-spread > 0.08, got {dist}")
        
        result = classify_mudra(kartarimukha_hand, "Right")
        self.assertEqual(
            result["name"], 
            "Kartarimukha",
            f"Expected Kartarimukha for spread index/middle fingers (dist={dist}), but got {result['name']}"
        )
        self.assertIn("V-shape", result["feedback"])

    def test_ardhapataka_requires_index_and_middle_together(self):
        """
        REGRESSION TEST:
        Ardhapataka has index and middle fingers straight and held TOGETHER
        (dist_idx_mid <= 0.08), with ring and pinky bent.
        """
        # Index tip at x = -0.01, Middle tip at x = +0.01 -> dist_idx_mid = 0.02 <= 0.08
        ardhapataka_hand = make_hand(
            ext_index=True,
            ext_middle=True,
            ext_ring=False,
            ext_pinky=False,
            idx_tip_x=-0.01,
            mid_tip_x=0.01,
        )
        dist = calculate_distance(ardhapataka_hand[8], ardhapataka_hand[12])
        self.assertLessEqual(dist, 0.08, f"Expected close fingers <= 0.08, got {dist}")
        
        result = classify_mudra(ardhapataka_hand, "Right")
        self.assertEqual(
            result["name"], 
            "Ardhapataka",
            f"Expected Ardhapataka for joined index/middle fingers (dist={dist}), but got {result['name']}"
        )
        self.assertIn("strictly together", result["feedback"])

if __name__ == "__main__":
    unittest.main()
