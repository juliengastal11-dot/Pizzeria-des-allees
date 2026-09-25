import type { Metadata } from "next";
import Link from "next/link";
import {
  Fiche,
  LienExterne,
  LienValeur,
  Ligne,
  Liste,
  PageTexte,
  Point,
  SectionTexte,
} from "@/components/layout/PageTexte";
import { Valeur } from "@/components/ui/Valeur";
import { adresseComplete, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Éditeur, hébergeur et informations légales du site de ${site.nom}, ${adresseComplete}.`,
  alternates: { canonical: "/mentions-legales" },
};

const { legal } = site;
const telephoneHref = `tel:${site.telephone.replace(/[^\d+]/g, "")}`;

export default function MentionsLegales() {
  return (
    <PageTexte
      surtitre="Informations légales"
      titre="Mentions légales"
      chapo={
        <>
          Conformément à la loi n°&nbsp;2004-575 du 21&nbsp;juin 2004 pour la confiance dans l’économie numérique, voici qui
          édite et qui héberge ce site.
        </>
      }
      avertissement={{
        titre: "Document provisoire",
        texte: (
          <p>
            Les informations en pointillés restent à fournir. L’ensemble de cette page est à relire et à valider par
            l’exploitant avant la mise en ligne.
          </p>
        ),
      }}
    >
      <SectionTexte id="editeur" titre="Éditeur du site">
        <Fiche>
          <Ligne terme="Nom commercial">{site.nom}</Ligne>
          <Ligne terme="Raison sociale">
            <Valeur valeur={legal.raisonSociale} />
          </Ligne>
          <Ligne terme="Forme juridique">
            <Valeur valeur={legal.formeJuridique} />
          </Ligne>
          <Ligne terme="Capital social">
            <Valeur valeur={legal.capital} />
          </Ligne>
          <Ligne terme="SIRET">
            <Valeur valeur={legal.siret} className="tabular-nums" />
          </Ligne>
          <Ligne terme="RCS">
            <Valeur valeur={legal.rcs} />
          </Ligne>
          <Ligne terme="TVA intracommunautaire">
            <Valeur valeur={legal.tva} className="tabular-nums" />
          </Ligne>
          <Ligne terme="Adresse">
            <address className="not-italic">{adresseComplete}</address>
          </Ligne>
          <Ligne terme="Téléphone">
            <LienValeur valeur={site.telephone} href={telephoneHref} />
          </Ligne>
          <Ligne terme="E-mail">
            <LienValeur valeur={site.email} href={`mailto:${site.email}`} />
          </Ligne>
        </Fiche>
      </SectionTexte>

      <SectionTexte id="publication" titre="Directeur de la publication">
        <p>
          <Valeur valeur={legal.directeurPublication} className="text-calcaire" />
        </p>
      </SectionTexte>

      <SectionTexte id="hebergement" titre="Hébergement">
        <Fiche>
          <Ligne terme="Hébergeur">{legal.hebergeur.nom}</Ligne>
          <Ligne terme="Adresse">
            <address className="not-italic">{legal.hebergeur.adresse}</address>
          </Ligne>
          <Ligne terme="Site">
            <LienExterne href={legal.hebergeur.site}>{legal.hebergeur.site.replace(/^https?:\/\//, "")}</LienExterne>
          </Ligne>
        </Fiche>
      </SectionTexte>

      <SectionTexte id="conception" titre="Conception et réalisation">
        <p>
          Site conçu et réalisé par <Valeur valeur={legal.concepteur} className="text-calcaire" />.
        </p>
      </SectionTexte>

      <SectionTexte id="propriete" titre="Propriété intellectuelle">
        <p>
          Les textes, le logo, les illustrations, les photographies et la mise en page de ce site appartiennent à
          l’éditeur ou sont utilisés avec l’accord de leurs auteurs. Toute reproduction, représentation ou adaptation,
          totale ou partielle, sans autorisation écrite préalable est interdite (articles L.&nbsp;335-2 et suivants du
          Code de la propriété intellectuelle).
        </p>
        <p>Les œuvres reproduites, notamment la fresque de la salle, restent la propriété de leurs auteurs.</p>
      </SectionTexte>

      <SectionTexte id="credits" titre="Crédits">
        <Liste>
          <Point>
            <strong>Photographies et visuels&nbsp;:</strong>{" "}
            {site.photos.provisoires ? (
              <>
                les visuels présentés sont provisoires. Certains ont été générés ou retouchés numériquement à partir
                de la salle et de sa fresque, en attendant le reportage photo prévu à la réouverture. Ils seront
                remplacés et leurs auteurs crédités ici.
              </>
            ) : (
              <Valeur valeur="[À CONFIRMER]" />
            )}
          </Point>
          <Point>
            <strong>Polices&nbsp;:</strong> Besley et Figtree, sous licence SIL Open Font License, hébergées avec le
            site.
          </Point>
          <Point>
            <strong>Pictogrammes&nbsp;:</strong> Lucide, sous licence ISC.
          </Point>
        </Liste>
      </SectionTexte>

      <SectionTexte id="services-tiers" titre="Services tiers et liens">
        <p>
          La commande en ligne, la réservation de table et la carte interactive sont assurées par des services
          extérieurs (Obypay, TheFork, Google Maps), qui restent responsables de leur contenu et de leur
          fonctionnement. Les liens vers d’autres sites s’ouvrent dans un nouvel onglet&nbsp;; nous ne répondons pas de
          leur contenu.
        </p>
      </SectionTexte>

      <SectionTexte id="mediation" titre="Médiation de la consommation">
        <p>
          En cas de litige qui n’aurait pas trouvé de solution avec nous, vous pouvez recourir gratuitement à un
          médiateur de la consommation (articles L.&nbsp;611-1 et suivants du Code de la consommation).
        </p>
        <p>
          Médiateur&nbsp;: <Valeur valeur="[MÉDIATEUR À DÉSIGNER]" />
        </p>
      </SectionTexte>

      <SectionTexte id="donnees" titre="Données personnelles">
        <p>
          Ce site ne dépose aucun cookie de suivi. Pour savoir quelles données sont traitées et comment exercer vos
          droits, consultez notre <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </SectionTexte>
    </PageTexte>
  );
}
