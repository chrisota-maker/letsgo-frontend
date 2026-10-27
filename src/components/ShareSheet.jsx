import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { formatDateLabel } from "../utils/dates";

// The "Who should see this day?" sheet, with a checkbox per friend.
// sharedFriendIds = who it's shared with right now, so those boxes start checked.
export default function ShareSheet({ date, sharedFriendIds, onSaved, onCancel }) {
  const { token } = useAuth();

  const [friends, setFriends] = useState([]);
  const [checkedIds, setCheckedIds] = useState(sharedFriendIds);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load my accepted friends.
  useEffect(() => {
    async function loadFriends() {
      try {
        const data = await apiFetch("/friendships", { token: token });
        const accepted = [];
        for (const friendship of data.friends) {
          if (friendship.status === "accepted") {
            accepted.push(friendship);
          }
        }
        setFriends(accepted);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }

    loadFriends();
  }, [token]);

  // Check or uncheck one friend.
  function handleToggle(friendId) {
    if (checkedIds.includes(friendId)) {
      const remaining = checkedIds.filter((id) => id !== friendId);
      setCheckedIds(remaining);
    } else {
      setCheckedIds([...checkedIds, friendId]);
    }
  }

  // Compare what's checked now with what was shared before,
  // then add the new ones and remove the unchecked ones.
  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      for (const friendId of checkedIds) {
        if (!sharedFriendIds.includes(friendId)) {
          await apiFetch("/day_shares", {
            method: "POST",
            token: token,
            body: { friend_id: friendId, share_date: date },
          });
        }
      }

      for (const friendId of sharedFriendIds) {
        if (!checkedIds.includes(friendId)) {
          await apiFetch(`/day_shares/${date}/${friendId}`, {
            method: "DELETE",
            token: token,
          });
        }
      }

      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onCancel}></div>

      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="share-heading">
        <div className="sheet-handle"></div>
        <h2 id="share-heading" className="sheet-heading">Who should see {formatDateLabel(date)}?</h2>
        <p className="share-subtitle">If they can see it, they're welcome.</p>

        {loading && <p className="muted">Loading...</p>}

        {!loading && friends.length === 0 && (
          <p className="muted">
            No peeps yet. <Link to="/peeps/find" className="link">Find a friend</Link> first.
          </p>
        )}

        {!loading && friends.length > 0 && (
          <ul className="share-list">
            {friends.map((friend) => (
              <li key={friend.friend_id}>
                <label className="share-option">
                  <input
                    type="checkbox"
                    checked={checkedIds.includes(friend.friend_id)}
                    onChange={() => handleToggle(friend.friend_id)}
                  />
                  <span className="avatar" aria-hidden="true">
                    {friend.friend_display_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="person-info">
                    <span className="person-name">{friend.friend_display_name}</span>
                    <span className="person-handle">@{friend.friend_username}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {error && <p role="alert" className="alert notice-spacing">{error}</p>}

        <div className="sheet-buttons">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}