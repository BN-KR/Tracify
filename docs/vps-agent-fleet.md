# VPS fleet repository

The VPS fleet is maintained separately from the Tracify application in the private [BN-KR/tracify-vps repository](https://github.com/BN-KR/tracify-vps).

- Windows checkout: `C:\tracify-vps`
- VPS checkout: `/home/orca/workspaces/tracify-vps`
- Operations: `docs/operations.md` in that repository
- Capacity results: `docs/capacity.md` in that repository
- Orca: select **tracify-vps**, then the **Tracify Fleet** terminal

The measured operating cap is six active slices, following successful read-only CLI tests through twelve simultaneous sessions. Durable missions and existing Tracify worktrees remain outside fleet source control. The previous dashboard integration is preserved; its exact continuation command is in the fleet operations guide.
