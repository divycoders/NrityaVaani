import math

def calculate_distance(p1, p2):
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)

def is_finger_extended(landmarks, finger_indices):
    # indices: [mcp, pip, dip, tip]
    mcp, pip, dip, tip = [landmarks[i] for i in finger_indices]
    
    # Distance from mcp to tip
    dist_mcp_tip = calculate_distance(mcp, tip)
    
    # Sum of segment lengths
    dist_segments = (calculate_distance(mcp, pip) + 
                     calculate_distance(pip, dip) + 
                     calculate_distance(dip, tip))
    
    # If straight, dist_mcp_tip should be close to dist_segments (ratio > 0.8)
    return dist_mcp_tip / dist_segments > 0.8 if dist_segments > 0 else False

def classify_mudra(landmarks, handedness):
    # 0: wrist
    # 1-4: thumb (cmc, mcp, ip, tip)
    # 5-8: index (mcp, pip, dip, tip)
    # 9-12: middle
    # 13-16: ring
    # 17-20: pinky
    
    thumb = [1, 2, 3, 4]
    index = [5, 6, 7, 8]
    middle = [9, 10, 11, 12]
    ring = [13, 14, 15, 16]
    pinky = [17, 18, 19, 20]
    
    ext_idx = is_finger_extended(landmarks, index)
    ext_mid = is_finger_extended(landmarks, middle)
    ext_rng = is_finger_extended(landmarks, ring)
    ext_pky = is_finger_extended(landmarks, pinky)
    
    # Distances for special mudras
    dist_thumb_ring = calculate_distance(landmarks[4], landmarks[16])
    dist_idx_mid = calculate_distance(landmarks[8], landmarks[12])
    dist_mid_rng = calculate_distance(landmarks[12], landmarks[16])
    dist_rng_pky = calculate_distance(landmarks[16], landmarks[20])
    
    # 1. Pataka: All 4 straight & together
    if ext_idx and ext_mid and ext_rng and ext_pky and dist_idx_mid < 0.05 and dist_mid_rng < 0.05:
        return {"name": "Pataka", "confidence": 0.95, "feedback": "Excellent posture. Keep your palm flat."}
    
    # 2. Mayura: Ring touching Thumb, others straight (evaluated before Tripataka)
    if dist_thumb_ring < 0.03 and ext_idx and ext_mid and ext_pky:
        return {"name": "Mayura", "confidence": 0.94, "feedback": "Graceful. Spread your other fingers like a peacock tail."}

    # 3. Tripataka: Pataka + Ring bent (ring not touching thumb)
    if ext_idx and ext_mid and not ext_rng and ext_pky and dist_thumb_ring >= 0.03:
        return {"name": "Tripataka", "confidence": 0.92, "feedback": "Good. Ensure the ring finger is bent significantly."}
        
    # 4. Kartarimukha: Index, Middle spread in a V-shape, Ring/Pinky bent
    if ext_idx and ext_mid and not ext_rng and not ext_pky and dist_idx_mid > 0.08:
        return {"name": "Kartarimukha", "confidence": 0.88, "feedback": "Great V-shape. Keep the index and middle fingers fully extended."}

    # 5. Ardhapataka: Index, Middle straight and held together, Ring/Pinky bent
    if ext_idx and ext_mid and not ext_rng and not ext_pky and dist_idx_mid <= 0.08:
        return {"name": "Ardhapataka", "confidence": 0.90, "feedback": "Nice. Keep your index and middle fingers strictly together."}
        
    # 6. Arala: Index bent, others straight
    if not ext_idx and ext_mid and ext_rng and ext_pky:
        return {"name": "Arala", "confidence": 0.85, "feedback": "Keep the other three fingers strictly together."}

    # 7. Shukatunda: Index bent, Ring bent, others straight
    if not ext_idx and ext_mid and not ext_rng and ext_pky:
        return {"name": "Shukatunda", "confidence": 0.82, "feedback": "Bend your index finger like a hook."}
        
    # 8. Alapadma: All spread & curved (heuristic: not fully extended, but spread)
    if not ext_idx and not ext_mid and not ext_rng and not ext_pky:
        # Check if spread (distances between tips are large)
        if dist_idx_mid > 0.05 and dist_mid_rng > 0.05:
             return {"name": "Alapadma", "confidence": 0.80, "feedback": "Beautiful lotus shape. Gracefully curve all your fingers."}

    return {"name": "Unknown", "confidence": 0.0, "feedback": "Adjust your hand posture to match a mudra."}
