export default function InvitePage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Invite Someone to Your Cliq</h1>
      <InviteClient cliqId={params.id} inviterId="" />
    </div>
  );
}
