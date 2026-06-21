
import React, { useState } from "react";
import { useReferrals } from "@/hooks/useReferrals";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const ReferralInvite = () => {
  const { user } = useAuth();
  const { referrals, loading, createReferral } = useReferrals(user?.id);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async () => {
    setSuccess(null);
    if (!email) return;
    const { error } = await createReferral(email);
    if (!error) setSuccess("Invitation envoyée !");
    else setSuccess("Erreur, réessayez.");
    setEmail("");
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Invitez un ami 🎁</h2>
      <div className="flex gap-2 mb-3">
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email du filleul"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleInvite} disabled={!email}>
          Inviter
        </Button>
      </div>
      {success && <div className="mb-2 text-xs">{success}</div>}
      <h3 className="font-semibold mb-1">Vos invitations :</h3>
      {loading ? (
        <div>Chargement…</div>
      ) : (
        <ul className="text-sm">
          {referrals.map(r => (
            <li key={r.id} className="mb-1">
              {r.referred_email} — <span className="italic">{r.status}</span> — code: <span className="font-mono">{r.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default ReferralInvite;
