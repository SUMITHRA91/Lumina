import { useEffect, useState } from "react";
import { ArrowLeft, UserPlus, Trash2, Shield, Phone, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { UserProfileButton } from "@/components/lumina/UserProfileButton";

type Contact = {
  id: number;
  name: string;
  phone: string;
  email?: string;
};

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/contacts/");
      const data = await response.json();
      setContacts(data);
    } catch (e) {
      console.error("Failed to fetch contacts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      const response = await fetch("http://localhost:8000/api/contacts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });
      if (response.ok) {
        setName("");
        setPhone("");
        setEmail("");
        fetchContacts();
      }
    } catch (e) {
      console.error("Failed to add contact", e);
    }
  };

  const deleteContact = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/contacts/${id}/`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchContacts();
      }
    } catch (e) {
      console.error("Failed to delete contact", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm font-sans">
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-serif text-2xl text-foreground">Trusted Contacts</h1>
        </div>
        <UserProfileButton />
      </header>

      <main className="px-6 lg:px-12 max-w-4xl mx-auto py-8">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
          {/* Add Contact Form */}
          <div className="space-y-6">
            <div className="p-6 rounded-[32px] bg-card border border-border/50 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-sage" />
                </div>
                <h2 className="font-serif text-lg">Add Trusted Person</h2>
              </div>

              <form onSubmit={addContact} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Full Name</label>
                  <Input 
                    placeholder="e.g. Mom" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Phone Number</label>
                  <Input 
                    placeholder="+1 234 567 890" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Email Address (Optional)</label>
                  <Input 
                    type="email"
                    placeholder="contact@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
                <Button type="submit" className="w-full rounded-2xl h-11 bg-sage hover:bg-sage/90">
                  Save Contact
                </Button>
              </form>
            </div>

            <div className="p-6 rounded-[32px] bg-crisis/5 border border-crisis/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-crisis mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These people will be notified if Lumina detects that you are in a crisis situation. 
                  Choose someone you trust completely.
                </p>
              </div>
            </div>
          </div>

          {/* Contacts List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground ml-1">Saved Contacts</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            ) : contacts.length === 0 ? (
              <div className="p-12 rounded-[32px] border-2 border-dashed border-border/40 flex flex-col items-center justify-center text-center gap-4">
                <User className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Your circle is empty. Add a trusted contact to ensure your safety.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className="group p-4 rounded-[28px] bg-card border border-border/50 shadow-sm flex items-center justify-between animate-fade-in"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-sage flex items-center justify-center text-primary-foreground font-serif text-lg">
                        {contact.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> {contact.phone}
                        </p>
                        {contact.email && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> {contact.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteContact(contact.id)}
                      className="rounded-full text-muted-foreground hover:text-crisis hover:bg-crisis/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmergencyContacts;
