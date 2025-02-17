import React, { useRef } from 'react'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useHookstate } from '@ir-engine/hyperflux'
import { ModalFooter, ModalHeader } from '@ir-engine/ui/src/primitives/tailwind/Modal'
import { useTranslation } from 'react-i18next'

export const ToSContents = () => {
  return (
    <div className="grid gap-y-2">
      <p>
        <strong>
          Terms of Service for the Private Preview and Public Preview “Beta” Versions of the Infinite Reality Studio
          Platform.{' '}
        </strong>
      </p>
      <p>
        THE INFINITE REALITY STUDIO PLATFORM AND, SERVICES ARE PRE-RELEASE AND AVAILABLE SOLELY “AS IS.” THIS APPLIES
        WHETHER THE USER, GUEST, OR ANY OTHER VISITOR WAS INVITED OR GAINED ACCESS TO THE PLATFORM OR SERVICE BY ANY
        OTHER MEANS. THIS ALSO APPLIES TO ANALOGOUS PRE-RELEASE DESIGNATED OFFERINGS, AND THEREFORE NONE OF THESE
        VERSIONS WILL BE FULLY FUNCTIONAL AND MAY CONTAIN ERRORS AND/OR DESIGN FLAWS, AND MAY HAVE REDUCED, DIFFERENT OR
        NO SECURITY, PRIVACY, AVAILABILITY, AND/OR RELIABILITY STANDARDS. YOU MAY USE A PRE-RELEASE OFFERING SOLELY AT
        YOUR OWN RISK, UNDERSTANDING THAT SUCH VERSIONS ARE NOT INTENDED FOR USE IN BUSINESS-CRITICAL, HEALTH-CRITICAL,
        OR SECURITY CRITICAL SYSTEMS. INFINITE REALITY MAY CHOOSE NOT TO MAKE AVAILABLE A PUBLICLY AVAILABLE COMMERCIAL
        VERSION OF ANY PRE-RELEASE/BETA INFINITE REALITY STUDIO CLOUD PLATFORM OFFERING. INFINITE REALITY MAY ALSO
        CHOOSE TO ABANDON DEVELOPMENT AND TERMINATE THE AVAILABILITY OF A PRIVATE OR PUBLIC BETA INFINITE REALITY STUDIO
        CLOUD PLATFORM OFFERING AT ANY TIME WITHOUT LIABILITY.
      </p>
      <p>
        Infinite Reality, Inc. (“Infinite Reality” or “Company”) provides the Infinite Reality Studio Platform (“iR
        Studio) which includes various other software, tools, applications, products, features and functionalities to
        allow hosts, guests, users and visitors to create, distribute, view, engage and connect including through their
        own 3D websites (the “Platform”). The following iR Studio terms of service (“Terms”) govern your use of the
        Platform and our Services and provide information about the Platform and our Services. Your use of this Platform
        and/or any of our Services is your acceptance of these Terms as well as your agreement to be bound by them and
        also the terms of our{' '}
        <a className="text-[#009bee] underline" href="https://www.ir.world/privacy-policy" target="_blank">
          Privacy Policy
        </a>
        . These Terms contain cross-references to other terms or provisions that may be applicable to you (for example,
        our{' '}
        <a className="text-[#009bee] underline" href="https://www.ir.world/privacy-policy" target="_blank">
          Privacy Policy
        </a>
        ) so be sure to read and understand those terms as well, since you are responsible for complying with them as
        they set forth a legally binding agreement between you and Infinite Reality. In addition, Infinite Reality and
        its affiliates provide other platforms, websites, services and products. When you use the other platforms,
        websites, services and products you agree to the terms of service and privacy policies applicable to them.
        &nbsp;Please be sure to read and understand those terms and conditions, as they set forth a legally binding
        agreement between you and Infinite Reality. For purposes of these Terms, the following words have the meanings
        stated below:{' '}
      </p>
      <p>
        “Account” means an iR Studio Account where you can create a profile using an email address or other information
        and which allows you to save Content &nbsp;and also purchase other iR Studio products and Services..{' '}
      </p>
      <p>
        “Agreement” means when you create an iR Studio Account, click to accept our Terms, or use our Platform, you
        agree to these Terms and{' '}
        <a className="text-[#009bee] underline" href="https://www.ir.world/privacy-policy" target="_blank">
          Privacy Policy
        </a>{' '}
        and to be bound by them.
      </p>
      <p>
        “Beta” means the Platform in a pre-release version before it is released in non-Beta version for general
        availability to the public or any other pre-release platform, service, feature or product.{' '}
      </p>
      <p>
        “Change” means amend, modify, remove, add, or other similar meanings that may or may not happen from time to
        time regardless whether it is specifically stated so. &nbsp;
      </p>
      <p>
        “Content” means text, photo, video, audio, code, software or any other material posted to the Platform or
        Service, whether by a User, Visitor or other Services.{' '}
      </p>
      <p>
        “Guest” means an instant visitor who enters a iR Space in iR Studio and who engages anonymously, either by
        invitation or any other means (e.g. without creating an Account).{' '}
      </p>
      <p>
        “Host” means anyone who is eighteen (18) years of age or older who has created an Account and built a iR Space
        in which Content exists.
      </p>
      <p>
        “Including” means that unless the context dictates otherwise, whenever the word “including” or similar is found
        in the Terms, it means “including, without limitation” and whenever the word “or” is found in the Terms it means
        “and/or.”
      </p>
      <p>
        “IR Passport” means a feature in iR Studio which if enabled by a Host, provides an opportunity for a User who
        has created an Account and opted into data sharing to experience a more personalized and seamless experience
        when interacting within any Space in iR Studio, such as taking their avatar, friends lists and/or inventory from
        Space to Space.{' '}
      </p>
      <p>
        “iR Space” means a defined area within the Platform created by a Host (e.g. a website) where Content may be seen
        and used by Visitors or Guests. &nbsp;{' '}
      </p>
      <p>
        “PAL” means a product using third-party (Google Gemini) generative artificial intelligence that allows a Host or
        website owner to engage visitors or users via audio and/or text chat to help facilitate sales, customer service
        and community management, which can be added to a Plan or purchased separately to be used as a standalone
        product or with a Third-Party Service. &nbsp;
      </p>
      <p>PAL Terms” means the PAL Terms of Service set forth below which govern your use of the PAL product</p>
      <p>
        “Plan” means an auto renewing &nbsp;month to month or annual rate plan that is purchased by a Host and which is
        required in order to create a Space which is not in Beta.{' '}
      </p>
      <p>“Platform” means the iR Studio Platform.</p>
      <p>
        “Services” means any feature, product, website or platform of the Company, including iR Studio and &nbsp;PAL.
      </p>
      <p>“Terms” means these iR Studio Terms of Service which govern your use of the Platform. </p>
      <p>“Third Party Service” means a service provider other than Infinite Reality.</p>
      <p>
        “User”, “you” and “your” means you as the User of our Services &nbsp;including a Host, a Visitor or Guest. If
        you use the Platform on behalf of a company or other entity then “you” includes you and that entity, and you
        represent and warrant that you are an authorized representative of the entity with the authority to bind the
        entity to the Terms and you agree to these Terms on the entity’s behalf.
      </p>
      <p>“User Content” means any Content posted by a User. </p>
      <p>“Visitor” means a User who enters a Space in the Platform, either anonymously or by creating an Account.</p>
      <p>
        <strong>Beta Services</strong>. THE PLATFORM AND SERVICES INCLUDING PAL ARE PRE-RELEASE AND AVAILABLE SOLELY “AS
        IS.” THIS APPLIES WHETHER THE USER, GUEST, OR ANY OTHER VISITOR WAS INVITED OR GAINED ACCESS TO THE PLATFORM OR
        SERVICE BY ANY OTHER MEANS. THIS ALSO APPLIES TO ANALOGOUS PRE-RELEASE DESIGNATED OFFERINGS, AND THEREFORE NONE
        OF THESE VERSIONS WILL BE FULLY FUNCTIONAL AND MAY CONTAIN ERRORS AND/OR DESIGN FLAWS, AND MAY HAVE REDUCED,
        DIFFERENT OR NO SECURITY, PRIVACY, AVAILABILITY, AND/OR RELIABILITY STANDARDS. THERE ARE NO REPRESENTATIONS,
        WARRANTIES OR GUARANTEES REGARDING SERVICE LEVELS OR LEVELS OF PERFORMANCE OF THE PLATFORM OR ANY SERVICES. YOU
        MAY USE A PRE-RELEASE VERSION SOLELY AT YOUR OWN RISK.{' '}
      </p>
      <p>
        WHEN YOU CREATE AN ACCOUNT, CLICK TO ACCEPT OUR TERMS, OR USE OUR PLATFORM, YOU AGREE TO THESE TERMS AND OUR{' '}
        <a className="text-[#009bee] underline" href="https://www.ir.world/privacy-policy" target="_blank">
          PRIVACY POLICY
        </a>{' '}
        AND TO BE BOUND BY THEM. PLEASE READ THESE TERMS AND OUR OTHER POLICIES CAREFULLY BEFORE USING OUR PLATFORM AS
        THEY CONTAIN IMPORTANT INFORMATION AND AFFECT YOUR LEGAL RIGHTS. THESE TERMS REQUIRE THE USE OF BINDING
        ARBITRATION ON AN INDIVIDUAL BASIS TO RESOLVE DISPUTES, RATHER THAN A JURY TRIAL OR CLASS ACTION IN COURT (AS
        DESCRIBED IN MORE DETAIL BELOW IN THESE TERMS), AND ALSO LIMIT THE REMEDIES AVAILABLE TO YOU IN THE EVENT OF A
        DISPUTE. IF YOU DO NOT AGREE WITH OUR TERMS, PLEASE DO NOT CREATE AN ACCOUNT OR USE OUR PLATFORM.{' '}
      </p>
      <p>
        From time to time, new Services (limited preview services, updated or new features to existing Services) may be
        offered on the Platform in a pre-release version. These new or updated features to existing Services or limited
        preview services shall be known, individually and collectively, as “Beta Services
        <strong>.</strong>” If you elect to use any Beta Services, then your use of the Beta Services is subject to the
        following terms and conditions: (i) You acknowledge and agree that the Beta Services are pre-release versions
        and may not work properly; (ii) You acknowledge and agree that your use of the Beta Services may expose you to
        unusual risks of operational failures; (iii) The Beta Services are provided as-is, so we do not recommend using
        them in production or business critical or other critical &nbsp;environments; (iv) Company reserves the right to
        modify, Change, or discontinue any aspect of the Beta Services at any time; (v) Commercially released versions
        of the Beta Services may Change substantially, and programs that use or run with the Beta Services may not work
        with the commercially released versions or subsequent releases; (vi) Company may limit availability of customer
        service support of the Beta Services; (vii) You acknowledge and agree to provide prompt feedback regarding your
        experience with the Beta Services in a form reasonably requested by us, including information necessary to
        enable us to duplicate errors or problems you experience; (viii) You acknowledge and agree that Company may
        track your browsing behavior, links clicked, items purchased, your device type, and to collect various data,
        including analytics, about how you use and interact with our Beta Services; (ix) You acknowledge and agree that
        all information regarding your use of the Beta Services, including your experience with and opinions regarding
        the Beta Services, is confidential, and may not be disclosed to a third party or used for any purpose other than
        providing feedback to iR Studio; (x) The Beta Services are provided “as is”, “as available”, and “with all
        faults”. To the fullest extent permitted by law, Infinite Reality disclaims any and all warranties, statutory,
        express or implied, with respect to the Beta Services including, but not limited to, any implied warranties of
        title, merchantability, fitness for a particular purpose and non-infringement.{' '}
      </p>
      <p>
        <strong>Feedback</strong>. You acknowledge and agree that we may use your feedback for any purpose, including
        product development purposes. At our request you will provide us with comments that we may use publicly for
        press materials and marketing collateral. Any intellectual property inherent in your feedback or arising from
        your use of the Beta Services shall be owned exclusively by the Company.{' '}
      </p>
      <p>
        <strong>The Platform. </strong>The Platform is provided with a license that allows you to use the Content posted
        to or made available through our Platform. Hosts do not have permission to use the assets in other 3D
        websites/applications without prior written consent. Any first-person Content provided by Infinite Reality that
        is licensed from a third-party, will be provided under the terms and conditions of the third-party license.
        Furthermore, where there are links to other Content, materials or websites from third-parties, the linked
        third-party websites are not under the control of Infinite Reality and we are not responsible for the Content of
        any third-party linked website or any link contained in a third-party linked website. We reserve the right to
        terminate any third-party link or linking program at any time. Infinite Reality does not endorse companies or
        products to which it links and reserves the right to note as such on its web pages. If you decide to access any
        of the third-party websites linked to our Platform, you do this entirely at your own risk.
      </p>
      <p>
        THIS PLATFORM AND SERVICES ARE AVAILABLE ONLY TO USERS WHO CAN FORM A LEGALLY BINDING CONTRACT UNDER APPLICABLE
        LAW. BY VISITING THE WEBSITE OR USING THE SERVICES, YOU REPRESENT AND WARRANT THAT YOU ARE (I) AT LEAST EIGHTEEN
        (18) YEARS OF AGE, (II) OTHERWISE RECOGNIZED AS BEING ABLE TO FORM LEGALLY BINDING CONTRACTS UNDER APPLICABLE
        LAW, AND/OR (III) NOT A PERSON BARRED FROM PURCHASING OR RECEIVING THE SERVICES FOUNDUNDER THE LAWS OF THE
        UNITED STATES OR OTHER APPLICABLE JURISDICTION.
      </p>
      <p>
        <strong>Community. </strong>By using the Platform, you are becoming a member of a community that depends on the
        goodwill and responsible behavior of each of its Users. You are prohibited from transmitting or communicating
        illegal conduct, images, or text, including those containing ethnic slurs, sexually explicit material,
        threatening material, calls for violence or death, terrorism, inflammatory or derogatory comments, or anything
        else that may be construed as harassing, offensive or unlawful (a more detailed list of prohibited Content is
        provided below). Users who violate these community standards, as determined by us in our sole discretion, may
        have their access to the Platform suspended or terminated as more specifically discussed in these Terms.
      </p>
      <p>
        <strong>
          Our{' '}
          <a className="text-[#009bee] underline" href="https://www.ir.world/privacy-policy" target="_blank">
            Privacy Policy
          </a>
          .{' '}
        </strong>
        Providing our Platform requires collecting and using your information. Our{' '}
        <a href="https://www.ir.world/privacy-policy" target="_blank">
          Privacy Policy
        </a>{' '}
        explains how we collect, use, and share your information. It also provides you with information as to ways you
        can control your information, including the use of privacy settings.
      </p>
      <p>
        <strong>Who can use our Platform?</strong> We want the Platform to be safe and secure in accordance with the
        law. Accordingly, we must ask that you agree to the following restrictions to use the Platform.
      </p>
      <ul role="list">
        <li>You must not be restricted from using or receiving the Platform under applicable laws;</li>
        <li>
          You must not be on an applicable Sanctioned, Screening or Denied Persons List and you must not have been
          identified as a Specially Designated National or placed on any U.S. Government list of prohibited, sanctioned,
          or restricted parties;
        </li>
        <li>You must not be located in a country that is subject to a U.S. Government embargo or sanction; and</li>
        <li>
          We must not have previously disabled any of your Infinite Reality account(s) for a violation of law or any of
          our policies.
        </li>
      </ul>
      <p>
        <strong>You must provide transparent and accurate information. </strong>You must provide us with accurate and up
        to date information (including Account registration information). You are responsible for the security of your
        Account information and you acknowledge and agree that it is your sole responsibility to maintain your Account
        information, including payment information. You should not share your log-in credentials with others, and you
        must immediately report any breach of your log-in credentials to us. You are prohibited from impersonating
        someone you are not.
      </p>
      <p>
        <strong>You will not and you agree not to do any of the following while using our Services.</strong>
      </p>
      <ul role="list">
        <li>
          Engage in any activity that does not comply with applicable law and regulations or otherwise engage in any
          illegal, manipulative, fraudulent, deceptive or misleading activity.
        </li>
        <li>
          The sale of illegal products, the publication of terrorist Content, manipulative design patterns, and
          disinformation.
        </li>
        <li>
          Displaying targeted advertisements to Users based on sensitive data such as race, religion, and political
          opinions.{' '}
        </li>
        <li>
          You will not advertise based on profiling using personal data relating to a Visitor, User, or Guest where you
          know with reasonable certainty that the Visitor or Guest is a minor.
        </li>
        <li>
          Using deceptive and/or manipulative interfaces that prevent Users from making informed and free choices.
        </li>
        <li>
          Violate (or help or encourage others to violate) these Terms or other applicable terms of service, or our
          policies, or do anything that interferes with or alters the intended operation of the Platform.
        </li>
        <li>
          Create Accounts or collect information in an unauthorized or automated way without our express permission.
        </li>
        <li>
          Buy, sell, or transfer any aspect of your Account (including your username) or solicit, collect, or use login
          credentials or badges of other Users.
        </li>
        <li>
          Sell, disclose, share, rent, lease, syndicate, modify, reverse engineer, decompile, lend or otherwise alter
          any user personal information and take all reasonable measures to protect all user personal information under
          your control or in your possession from unauthorized access by third-parties.
        </li>
        <li>
          Post private or confidential information or do anything that violates someone else’s rights, including
          intellectual property rights.
        </li>
        <li>Use a domain name or URL in your username without our prior written consent.</li>
        <li>Damage, interfere with or unreasonably overload the Platform.</li>
        <li>Introduce any code intended to disrupt or interfere with the Platform.</li>
        <li>
          Alter or delete any information, data, text, links, images, software, chat, communications and other Content
          available through the Platform or Services.
        </li>
        <li>Access the Platform by expert system, electronic agent, “bot” or other automated means.</li>
        <li>Use scripts or disguised redirects to derive benefit from us.</li>
        <li>
          Modify, reverse engineer, reverse assemble, decompile, copy or otherwise derive any of our source code for any
          reason.
        </li>
        <li>
          Post any material in any form whatsoever on the Platform within our community that (i) is discriminatory,
          harassing, hateful, bullying, abusive, pornographic, threatening, defamatory, obscene, or violent, (ii)
          promotes weapons, firearms or any technology of violence; or (iii) is considered junk mail, spam, a part of a
          pyramid scheme, a disruptive message or disruptive advertisement, or (iv) otherwise is unlawful or violates
          any third-party’s right of privacy or publicity.
        </li>
        <li>
          Infringe any third-party’s patent, copyright, service mark, trademark or other intellectual property right of
          any kind or misappropriate the trade secrets of any third-party in connection with your use of the Platform or
          Services.
        </li>
        <li>
          Use manual or automated software, devices or other processes to “scrape,” “crawl,” “spider”, “data-mine”, or
          “index” any page or Content.
        </li>
        <li>Hack or interfere with the Services or the Platform, its servers or any connected networks.</li>
        <li>
          Access the Platform from a different Account or address, including a different blockchain address if we have
          blocked any of your other Accounts or addresses from accessing our Platform, unless you have our prior written
          permission.
        </li>
        <li>Use the Platform for money laundering, terrorist financing or other illicit finance.</li>
        <li>
          Use the Platform to carry out any financial activities subject to registration or licensing, including
          creating, selling or buying securities, commodities, options or debt instruments.
        </li>
        <li>
          Use the Platform to create, sell or buy NFTs or other items that give owners’ rights to participate in an
          initial coin offering (“ICO”) or any securities offering, or that are redeemable for securities, commodities,
          or other financial instruments.
        </li>
        <li>
          Use the Platform to engage in NFT price manipulation, fraud, or other deceptive, misleading, or manipulative
          activity.
        </li>
        <li>
          Use the Platform to buy, sell or transfer stolen items, fraudulently obtained items, items taken without
          authorization, or any other illegally obtained items.
        </li>
        <li>
          Use the Platform to buy, sell or transfer alcohol or any drug, whether it is a prescription drug or available
          over the counter.
        </li>
      </ul>
      <p>
        <strong>Responsibility of Users and Visitors. </strong>We have not reviewed, and cannot review, all the Content
        posted in a Space whether by a Host or Guest, or made available on or through our Platform or Services by Users
        or anyone else on websites that link to, or are linked from, our Platform or Services. We are not responsible
        for any use or effects of Content or third-party websites on the Platform or Services. For example:
      </p>
      <ul role="list">
        <li>We do not have any control over third-party websites.</li>
        <li>A link to or from our Platform does not represent or imply that we endorse any third-party website.</li>
        <li>
          We do not endorse any Content or represent that Content is accurate, useful, or not harmful. Content could be
          offensive, indecent, or objectionable; include technical inaccuracies, typographical mistakes, or other
          errors; or violate or infringe the privacy, publicity rights, intellectual property rights, or other
          proprietary rights of third-parties.
        </li>
        <li>
          The Host is responsible for the Content available in the Space, and any harm resulting from that Content. It
          is your responsibility to ensure that the Content abides by applicable laws and by these Terms.
        </li>
        <li>
          We are not responsible for any harm resulting from anyone’s access, use, purchase, or downloading of Content,
          or for any harm resulting from third-party websites. You are responsible for taking the necessary precautions
          to protect yourself and your computer systems from viruses, worms, Trojan horses, and other harmful or
          destructive Content.
        </li>
        <li>
          Any Content that is for sale through our Platform is the seller’s sole responsibility, and you must look
          solely to the seller for any damages or liability that result from your purchase or use of Content.
        </li>
        <li>
          We are not a party to, and will have no responsibility or liability for, any communications, transactions,
          interactions, or disputes between you and the provider of any Content.
        </li>
      </ul>
      <p>
        Please note that additional third-party terms and conditions may apply to Content you download, copy, purchase,
        or use.
      </p>
      <p>
        <strong>European Union Digital Services Act (“DSA”). </strong>This Section sets out provisions, processes and
        disclosures, as required under the DSA, which regulates the provision of certain digital intermediary services
        provided in the European Union (“EU”) and sets out rules on the role of providers and imposes content moderation
        requirements and transparency obligations. These provisions apply to you if you are in the EU and/or if you are
        using the Platform or Services falling within the scope of the DSA. In the event of any conflict between the
        terms set out in this Section and the other provisions of these Terms, the terms of this Section shall prevail.
      </p>
      <p>
        <strong>Rules of conduct</strong>. Users are prohibited from providing, publishing, or transmitting content
        which is incompatible with or violates these Terms or any applicable laws in the EU ("Unauthorized Content").
      </p>
      <p>
        <strong>Content moderation overview</strong>. Infinite Reality may voluntarily take action against any
        Unauthorized Content, in accordance with these Terms. In addition, Infinite Reality may receive notices from EU
        authorities reporting the presence of alleged illegal content on (or transmitted through) this Platform or any
        Service (including without limitation any website hosted by Infinite Reality). Infinite Reality may, at any time
        and in some cases, without prior notice, remove any Unauthorized Content provided on (or through) this Platform
        or any Service or suspend or terminate access to a whole Service (e.g., disabling an Account). In addition, with
        respect to “repeat offenders,” namely Users frequently providing manifestly Unauthorized Content, Infinite
        Reality may suspend or terminate their access to the Platform or Services. In addition, if any User frequently
        provides unfounded notices of alleged Unauthorized Content, Infinite Reality may suspend the processing of its
        notices.{' '}
      </p>
      <p>
        <strong>Measures and tools for review</strong>. Notices and orders are generally subject to human review.
        Infinite Reality may also use a machine learning tool or model that helps process certain claims and detect
        phishing on websites hosted by Infinite Reality. Actions taken in response to notices and/or orders which relate
        to User Content, if any, are generally subject to human review.
      </p>
      <p>
        <strong>Content moderation decisions</strong>. If you disagree with a Content moderation decision regarding the
        presence of information considered to be illegal Content on an Infinite Reality EU online platform or a decision
        taken by Infinite Reality to remove (or not to not remove) Content or to suspend, restrict or terminate (or to
        not suspend, restrict or terminate) access to an Infinite Reality EU online platform on the ground that you or
        any User of the Service provided Unauthorized Content, you may lodge a complaint with Infinite Reality. The
        complaint must be lodged within six (6) months from the date on which you are informed of the decision. To lodge
        your complaint, you should respond to the email or other communication informing you of the decision and provide
        any additional context or information for Infinite Reality to reassess the decision. Infinite Reality will
        review your complaint and respond. If a User frequently provides manifestly unfounded complaints, Infinite
        Reality may suspend the processing of such complaints, after a warning.{' '}
      </p>
      <p>
        <strong>Notification of violations. </strong>You can notify us of Content that you think is illegal, including
        Content that you think violates these Terms or any of our other policies, or any other Content you find to be
        inappropriate, as well as if you are notified that Content you have posted infringes on the intellectual
        property rights of any other third-party, by contacting{' '}
        <a href="mailto:CustomerCare@theinfinitereality.com">Customer Care</a>. Note that you are required to notify us
        if you receive an infringement notice or other take down request regarding your Content whether received through
        the Platform, Services or by any other means, and failing to do so is considered a material breach of these
        Terms. Once Infinite Reality receives a report, it will review the report and in its sole discretion determine
        whether such Content shall be removed. Furthermore, we do not need to receive a report to remove Content, and we
        may do so at any time.{' '}
      </p>
      <p>
        <strong>Copyright infringement notices and Digital Millennium Copyright Act. </strong>We respect the
        intellectual property rights of others and we ask you to do the same. We comply with the requirements of the
        Digital Millennium Copyright Act (the “DMCA”) and the Platform avails itself of the protections under the DMCA.
        If you believe that any Content infringes upon any copyright which you own or control, you may send a written
        notification with the following information to{' '}
        <a href="mailto:CustomerCare@theinfinitereality.com">Customer Care</a>:
      </p>
      <ul role="list">
        <li>
          • A description of the copyrighted work or other intellectual property that you claim has been infringed, with
          sufficient detail so that we can identify the alleged infringing material;
        </li>
        <li>
          • The specific location or user that contains the alleged infringing material, with reasonably sufficient
          information to enable us to locate the alleged infringing material on the Platform;
        </li>
        <li>• Your name, mailing address, telephone number and email address;</li>
        <li>
          • The electronic or physical signature of the owner of the copyright or a person authorized to act on the
          owner’s behalf;
        </li>
        <li>
          • A statement by you that you have a good faith belief that the disputed use is not authorized by the
          copyright owner, its agent, or the law; and
        </li>
        <li>
          • A statement by you that the information contained in your notice is accurate and that you attest under
          penalty of perjury that you are the copyright owner or that you are authorized to act on the copyright owner’s
          behalf.
        </li>
      </ul>
      <p>
        Our policy is to (i) remove or disable access to Content that we know to be infringing the intellectual property
        rights of third parties or that has been identified in a valid DMCA notice and (ii) in appropriate circumstances
        terminate the Accounts of and block access to the Platform by any Users who in our sole discretion, are repeat
        infringers. Knowingly misrepresenting in a notification that material is infringing can subject you to damages,
        including costs and attorneys’ fees, incurred by us or the claimed infringer. You understand that we may forward
        your notification (including your contact information) to the author of the allegedly infringing Content so they
        understand why it is no longer available and they can contact you to resolve any dispute.
      </p>
      <p>
        <strong>Counter notice to restore User Content removed for alleged copyright infringement</strong>. If you
        believe that your Content is not infringing or that you have the authority to use the Content, you may send a
        counter notice as follows:
      </p>
      <ul role="list">
        <li>• Your name, address, telephone number and email address;</li>
        <li>• A description of where on the Platform the Content that was removed or disabled previously appeared;</li>
        <li>
          • A statement under penalty of perjury that you have a good faith believe that the Content was removed or
          disabled as a result of a mistake or misidentification;
        </li>
        <li>
          • A statement that you consent to the jurisdiction of the U.S. District Court for the judicial district in
          which your address is located, or if your address is outside of the United States, the District of New York
          and that you will accept service of process from the person who filed the original DMCA notice or an agent of
          that person; and
        </li>
        <li>• Your electronic or physical signature.</li>
      </ul>
      <p>
        You understand that we may send a copy of any counter notice (including contact information) to the party that
        initially sent the notification of infringement, which they can use to contact you. Unless the copyright owner
        files an action seeking a court order against the provider of the Content, the removed Content may be replaced
        or access to it restored in after receipt of the counter-notice, in our sole discretion.
      </p>
      <p>
        <strong>The Platform license</strong>. We grant to you a non-exclusive, limited, revocable, non-transferable,
        non-assignable, non-sublicensable and personal right and license to access and use the Platform, subject to the
        additional Terms of your Plan (the “License”). This License is not for sale or for redistribution of any kind
        and the License is granted to you for the sole purpose of enabling you to use the Platform as permitted by these
        Terms.
      </p>
      <p>
        <strong>Permissions and licenses you give to us</strong>. As part of your agreement with us, you agree to give
        us the permissions we need and require to provide our Platform and Services. Although we do not claim ownership
        of User Contentposted on or through the Platform or Services, you therefore grant to us a non-exclusive, royalty
        free, fully paid-up, transferable, sub-licensable, perpetual, worldwide right and license to use your Content
        and you represent you have the right to do so. When you share, post, submit, or upload User Content including
        Content that is covered by intellectual property rights (like photos, videos, artwork, words, music, etc.) on or
        in connection with the Platform or Services, you hereby further grant to us a non-exclusive, royalty free, fully
        paid-up, transferable, sub-licensable, perpetual, worldwide right and license to host, store, use, distribute,
        modify, run, copy, localize, reproduce, publicly perform, publicly display, translate, transfer, distribute and
        create derivative works of and collective works with your User Content (the “User Content License”). To the
        extent any moral rights are not transferable or assignable, you hereby waive and agree never to assert any and
        all moral rights (droit moral) or to support, maintain or permit any action based on any moral rights that you
        may have in or with respect to any User Content you submit or upload on or through the Platform or Services. The
        rights and User Content License you grant in these Terms are provided on a through-to-the-audience basis,
        meaning the owners or operators of third-party services will not have separate liability to you or any
        third-party for the User Content that you have made available on or through the Platform or Services or used on
        those third-party services via our Platform or Services. In addition to and not in limitation of the foregoing,
        the User Content License includes the right for us to reference your Content with other User Content or material
        to promote, market or advertise the Company, or our Platform. &nbsp;We may also use User Content for educational
        purposes to promote the Platform (and we will reasonably determine whether a use is educational). We are not
        required to give you any attribution or compensation for any reason. We are not required to use the User Content
        License or exploit any of the rights granted by you. By uploading or submitting any User Content to the Platform
        or Services, you waive any rights to prior inspection or approval of any marketing or promotional materials
        related to such Content.
      </p>
      <p>
        <strong>Components under other licenses</strong>. The Platform or Services may include Infinite Reality or
        third-party components with separate legal notices or terms as may be described in proprietary notices
        accompanying the Platform component. If and to the extent there is a conflict between the terms in this License
        and the license terms associated with a component, the license terms associated with a component control only to
        the extent necessary to resolve the conflict. It is your responsibility to have appropriate rights or licenses
        for Content you wish to use or create.
      </p>
      <p>
        You represent and warrant (i) that you own or have secured all rights necessary to use, publicly perform,
        publicly display, distribute and deliver all of your Content and to grant this User Content License, and (ii)
        that your User Content does not infringe on anyone else’s intellectual property rights. You have full
        responsibility for any User Content you post or submit, and we take no responsibility and assume no
        responsibility or liability for any of your User Content. &nbsp;This User Content License survives even if you
        stop using the Platform or Services, or terminate or delete your Account. Remember that if you delete your User
        Content or Account, your User Content will continue to appear if, among other things you shared it with others
        and they have not deleted it. To learn more about how we use information, and how to control or delete your
        Content, review the{' '}
        <a className="text-[#009bee] underline" href="https://www.ir.world/privacy-policy" target="_blank">
          Privacy Policy
        </a>
      </p>
      <p>
        In addition to the foregoing and not in limitation thereof, the rights and User Content License you have granted
        to us includes the right to reproduce sound and video recordings (and make mechanical reproductions of the
        musical works embodied in all such recordings), and publicly perform and communicate to the public such
        recordings (and the musical works embodied therein), all on a royalty-free basis; which means that you are
        granting us the right to use your User Content without the obligation to pay royalties to any third-party,
        including, but not limited to, a sound recording copyright owner (e.g., a record label), a musical work
        copyright owner (e.g., a music publisher), a performing rights organization (e.g., ASCAP, BMI, SESAC, etc.) (a
        “PRO”), a sound recording PRO (e.g., SoundExchange), any film studio, any unions or guilds, and engineers,
        producers or other royalty participants involved in the creation of your User Content. If you are a composer or
        author of a musical work and are affiliated with a PRO, then you must notify your PRO of the royalty-free
        license you grant through these Terms to us. You are solely responsible for ensuring your compliance with the
        relevant PRO’s reporting obligations. If you have assigned your rights to a music publisher, then you must
        obtain the consent of such music publisher to grant the royalty-free license(s) set forth in these Terms or have
        such music publisher enter into these Terms with us. You should not presume that since you authored a musical
        work that you have all the rights necessary to grant us the rights and licenses in these Terms.
      </p>
      <p>
        You also give us permission to show your username, profile picture, and information about your actions or
        relationships (e.g. likes, follows, etc.) next to or in connection with Accounts, ads, offers and other
        sponsored Content that you follow or engage with that are displayed on the Platform, without any compensation to
        you other than as provided in these Terms. You also agree that we can download and install updates to the
        Platform on your device.
      </p>
      <p>
        <strong>Other content licenses.</strong> Subject to your compliance with our Terms and our other policies, we
        grant you a non-exclusive, limited, revocable, non-transferable, non-assignable, non-sublicensable and personal
        right and license to use other Content that we develop and make available on our Platform solely for use on our
        Platform (the “Other Content License”).
      </p>
      <p>
        <strong>Commercial use</strong>. Subject to these Terms, the License, and the Other Content License, you are
        expressly prohibited from selling, reselling, sublicensing, or otherwise redistributing &nbsp;(i) the Platform
        or Services, (ii) the License or any other License (iii) any registration data, (iv) any Content, materials,
        information, text, data, copyrights, trademarks, logos, designs, insignia, images, photos, musical compositions,
        sound recordings, screenshots, videos, chats, posts, graphics, identifying marks, software, code, App pages, and
        other original works of authorship or intellectual property uploaded to or incorporated into the Platform or
        Services by or on behalf of the Company, which is and shall remain the sole and exclusive property of Company or
        the applicable third-party licensor thereof, or (v) any User Content, that you or any other user submits or
        uploads onto the Platform or Services which User Content is and shall remain the sole and exclusive property of
        you or the applicable User (or the applicable third-party licensor thereof), unless subject to any other written
        agreement between the Company and you or any other User or third-party licensor, as applicable.
      </p>
      <p>
        <strong>Ownership</strong>. As between any User and Company, Company retains all ownership, right, title and
        interest in and to the Platform and Services, throughout the world, in perpetuity, including, (i) all text,
        graphics, typefaces, formatting, graphs, designs, editorial Content, HTML, look and feel, software, and data,
        (ii) all business processes, technology, tools, procedures, methods, and techniques used in the Platform or
        Services, (iii) all other materials and Content uploaded or incorporated into the Platform or Services,
        including all Content (but excluding User Content, which as between Company and the applicable User is owned by
        the applicable User subject to the User Content License granted by such User to Company pursuant to these
        Terms), (iv) all associated trade secret rights and all other intellectual property and proprietary rights
        recognized anywhere in the world; (v) all improvements, enhancements, features, contributions, and additions;
        and (vi) the coordination, selection, arrangement and enhancement of such Platform or Services as a Collective
        Work under the United States Copyright Act, as amended (collectively, “Company IP”) and nothing contained herein
        shall be construed as creating or granting to any User any right, title or interest in and to such Company IP
        other than the express License and Other Content License granted therein pursuant to these Terms. Company IP is
        protected in all forms, media and technologies now known or hereinafter developed as well as by the domestic and
        international laws of copyright, trademarks, patents, and other proprietary rights and laws.
      </p>
      <p>
        <strong>Additional rights we retain. </strong>If you select a username or similar identifier for your Account,
        we may Change it, or disable, suspend or freeze your Account if we believe it is appropriate or necessary to do
        so (for example, if it infringes someone’s intellectual property, impersonates another user, or is offensive or
        suggestive). If you use Content covered by intellectual property rights that we have and make available in the
        Platform or Services (for example, images, designs, videos, music or sounds we provide that you add to Content
        you create or share), we retain all rights to our Content (but not yours). Removal of any marks indicating our
        intellectual property rights such as trademarks and copyright is prohibited.{' '}
      </p>
      <p>
        You can only use our intellectual property, patents and trademarks or similar marks as expressly permitted by
        these Terms or with our prior written permission. You acknowledge that we are the sole and exclusive owner of
        our Company IP and other intellectual property. &nbsp;Registration or attempted registration of our marks in
        whole or in part is prohibited. You may not manufacture, sell or give-away merchandise items bearing any of our
        marks, except pursuant to an express written trademark license from us. You may not imitate our distinctive
        design, logos or typefaces or other trade dress, except pursuant to an express written trademark license from
        us. You must obtain written permission from us or under an open source license to modify, create derivative
        works of, decompile, or otherwise attempt to extract source code from us.
      </p>
      <p>
        <strong>Content removal and disabling or terminating your Account.</strong> We may require you to provide
        additional information and documents in certain circumstances such as at the request of any government authority
        as any applicable law or regulation dictates, or to investigate a potential violation of these Terms. In such
        cases, we in our sole discretion, may disable your Account and block your ability to access our Platform or
        Services until such additional information and documents are processed by us. If you do not provide complete and
        accurate information in response to such a request, we may refuse to restore your access to our Platform or
        Services. Content you delete may persist for a limited period of time in backup copies and will still be visible
        where others have shared it.
      </p>
      <p>
        <strong>AI Technology</strong>.{' '}
      </p>
      <p>
        Our Company utilizes generative artificial intelligence (AI) technology to enhance and improve the Services we
        provide. Please note that this technology is still experimental and evolving. While we strive to offer the most
        accurate and efficient results, there may be instances where the AI may not function as intended, experience
        performance limitations, or produce unexpected, fictitious, incorrect, or offensive outcomes that do not
        represent the views of the Company. By using our Services, you acknowledge and accept that the use of generative
        AI comes with inherent risks, and we cannot guarantee flawless performance. You agree that our Company will not
        be held responsible for any issues, errors, loss or damages arising from your use of the AI technology. If you
        have any concerns or require further clarification, please contact{' '}
        <a href="https://help.theinfinitereality.com/hc/en-us">Customer Care</a>.
      </p>
      <p>
        <strong>Paid Services, plans and fees</strong>. While some of the Beta releases and features may be &nbsp;free
        to use, in order to use some features of the Platform or any Service once it is no longer in Beta and no longer
        free to use, you will be required to purchase a Plan. Some of our Beta releases and features may require the
        purchase of a Plan. &nbsp;This section and others explain how we handle payments and transactions for those
        Plans (“Plan Fees”). Once purchased You agree and authorize Company or its affiliates or authorized agents, as
        applicable, to automatically bill and charge you the Plan Fee using your selected payment method (acceptable to
        Infinite Reality) in regular intervals (such as monthly or annually) using our third-party payment processor,
        Stripe (“Payment Processor”), and all payments will be processed in accordance with Stripe’s terms of service
        and privacy policy. You agree to pay us, through the Payment Processor, all charges at the prices then in effect
        for any purchase in accordance with the applicable payment terms. You agree to make payment using the payment
        method you provide with your Account, and you must notify Company of any Change in your payment account
        information, either by updating your Account or by contacting Customer Service. We reserve the right to correct,
        or to instruct our Payment Processor to correct, any errors or mistakes. &nbsp;Should you choose not to purchase
        a Plan, you will no longer be able to access or use iR Studio and any User Content you created will be lost. In
        addition, when you create, upload or post Platform Content, use iR Studio creator tools or use certain features,
        products or functionalities on our Platform, you may be subject to additional fees and charges, including
        renewals (“Fees”) established from time to time, and as may be adjusted from time to time, in the sole
        discretion of Company.{' '}
      </p>
      <p>
        <strong>Fees For Third Party Services</strong>. Third Party Services purchased via the Services may be subject
        to different refund or other policies that those Third-Party Services determine, and such Third-Party Services
        may be non-refundable. The purchase terms and conditions for such Third-Party Services may be displayed during
        the purchase process, such as through a link to the purchase terms and conditions. It is your responsibility to
        verify your ability to purchase, cancel or obtain a refund for a Third-Party Service. Unless otherwise stated in
        this Agreement, we do not offer refunds for purchases of Third-Party Services.
      </p>
      <p>
        <strong>Cancellation andFee changes</strong>
        <em>.</em> Company reserves the right to impose Fees or change its Plan Fees and Fees at any time, and such
        changes shall either be posted online (e.g. on the Platform) and effective immediately without need for further
        notice to you, or notice shall be provided to you by email, subject to the terms of your Plan. New fees will not
        apply retroactively. If you do not agree with the Fee changes, you have the right to reject the change by
        canceling the Plan and any other additional products you purchased, before your next payment date which can be
        done by logging into the iR Studio dashboard. If you do choose to cancel, you can do so at any time, and the
        cancellation will be effective at the end of the next billing term. All amounts are non-refundable unless
        otherwise noted in your Plan.
      </p>
      <p>
        <strong>Auto Renewal.</strong> To ensure that you do not experience an interruption or loss of service, all
        Services are offered on automatic renewal unless otherwise specified. Unless prohibited by law, Company will
        automatically renew the applicable Service upon expiration of the then current term for a renewal period equal
        in time to the most recent Service period, at the then current list price for such Service, and charge the
        payment method associated with your Account for such Service. For example, if you are on a monthly Plan, each
        billable renewal period will be for one (1) month. By agreeing to these Terms, you authorize us to charge your
        payment method on file with your Account. You may cancel your automatic renewal through your Account, and such
        cancellation will be effective at the end of the next billing term.
      </p>
      <p>
        <strong>Taxes.</strong> All Fees are exclusive of applicable taxes, unless explicitly stated otherwise.
        <strong> </strong>You will be solely responsible to pay any and all sales, use, value-added and other taxes,
        duties, and assessments (except taxes on our net income) now or hereafter claimed or imposed by any governmental
        authority associated with your use of our Platform or Services.
      </p>
      <p>
        <strong>Disputes between Users and Content owners. </strong>If a User has any issues with any Content on the
        Platform, the User should first contact the Content owner directly to make a genuine, good faith effort to
        resolve the issue. We want to make sure that the use of our Platform is a positive experience and as a result,
        we have the right (but not the obligation) to intervene in issues between Users and Content owners so that we
        can help resolve them. If we choose to take action in any dispute between a User and a Content owner, our
        decision is final and User and Content owner will accept our decision. User agrees to work with us in a timely
        manner to resolve all such issues, and failure to do so is a violation of these Terms.<strong> </strong>
      </p>
      <p>
        <strong>Our Agreement. </strong>If you use certain other features or related services in addition to your Plan,
        you must agree to any additional terms governing those features or services that will also become a part of our
        Agreement. If any of those terms conflict with this Agreement, those other terms will govern. If any aspect of
        this Agreement is unenforceable, the rest will remain in effect. &nbsp;Any amendment or waiver to our Agreement
        must be in writing and signed by us. If we fail to enforce any aspect of this Agreement, it will not be a
        waiver. We reserve any and all rights not expressly granted to you.
      </p>
      <p>
        <strong>How to contact the company with questions. </strong>If you have questions about these Terms, our
        Platform, our Services, our policies, or any other matter, you can contact us by emailing{' '}
        <a href="mailto:CustomerCare@theinfinitereality.com">Customer Care</a> or by mail at the address below:
      </p>
      <p>Infinite Reality, Inc. </p>
      <p>Attn: Customer Care</p>
      <p>16 Washington St.</p>
      <p>P.O. Box 13</p>
      <p>Norwalk, CT 06854</p>
      <p>
        <strong>Who has rights under this Agreement? </strong>This Agreement does not give rights to any third-parties
        and you cannot transfer your rights or obligations under this agreement without our prior written consent.
        Furthermore, our rights and obligations can be assigned to others. For example, this could occur if our
        ownership Changes (as in a merger, acquisition, or sale of assets) or by law.
      </p>
      <p>
        <strong>Who is responsible if something happens?</strong> We will use reasonable skill and care in providing the
        Platform and Services to you and in keeping a safe and secure environment, but we cannot guarantee that the
        Platform or Services will always function without disruptions, delays, or imperfections. We make no
        representations, warranties or guarantees regarding service levels or levels of performance of the Platform or
        any Services except solely to the extent expressly agreed in a service level agreement for a specific Service
        Plan and such service level agreement is made a part of these Terms. We do not accept responsibility for losses
        (i) not caused by our material breach of these Terms, (ii) from any offensive, inappropriate, obscene, unlawful,
        or otherwise objectionable Content posted by others that you may encounter on the Platform or Services, or (iii)
        from events beyond our reasonable control.
      </p>
      <p>
        WE ARE NOT RESPONSIBLE AND HAVE NO LIABILITY FOR ANY DELETION, CORRECTION, DESTRUCTION, DAMAGE, LOSS, OR FAILURE
        TO STORE OR BACK-UP ANY USER CONTENT. YOU ARE FULLY RESPONSIBLE AND LIABLE FOR THE CONTENT THAT YOU UPLOAD. THIS
        SECTION DOES NOT EXCLUDE OR LIMIT OUR LIABILITY FOR ANYTHING WHERE THE LAW DOES NOT PERMIT US TO DO SO.
      </p>
      <p>
        <strong>Indemnification. </strong>To the maximum extent permitted by law,<strong> </strong>you agree to release,
        defend and indemnify us, as well as our respective officers, directors, members, managers, employees, equity
        holders, successors, agents, licensors, contractors, service providers, vendors, subsidiaries and affiliates
        (collectively the “ Company Indemnitees”), from any and all claims, demands, damages, losses and causes of
        action (including attorneys’ fees and court costs) of every kind or nature, known or unknown, foreseen or
        unforeseen, in law or equity whether in tort, contract or otherwise, including but not limited to damages to
        property or personal injury directly or indirectly arising out of or relating to: (1) your access to or use of
        the Platform or Services, (including any interactions with, or act or omission of, other users of the Platform
        or any third-party links, advertisements or other Content), (2) your breach of these Terms including any
        infringement of intellectual property rights, (3) your negligence or misconduct, or (4) any information or
        materials in any form whatsoever that are provided by you (or through your username or password).{' '}
      </p>
      <p>
        BY ENTERING INTO THIS AGREEMENT, YOU EXPLICITLY WAIVE ANY PROTECTIONS, WHETHER ESTABLISHED BY LAW OR OTHERWISE,
        THAT WOULD LIMIT THE SCOPE OF THIS RELEASE TO ONLY THOSE CLAIMS YOU ARE AWARE OF OR SUSPECT EXIST AT THE TIME OF
        AGREEING TO THIS RELEASE. YOU AGREE TO COOPERATE FULLY AND REASONABLY IN OUR DEFENSE OR SETTLEMENT OF ANY CLAIM.
        WE RESERVE THE RIGHT, AT OUR REASONABLE DISCRETION, TO TAKE EXCLUSIVE CONTROL OVER THE DEFENSE AND SETTLEMENT OF
        ANY MATTER FOR WHICH YOU ARE PROVIDING INDEMNIFICATION.
      </p>
      <p>
        <strong>California residents.</strong> TO THE EXTENT APPLICABLE, YOU HEREBY WAIVE THE PROTECTIONS OF CALIFORNIA
        CIVIL CODE § 1542 (AND ANY ANALOGOUS LAW IN ANY OTHER APPLICABLE JURISDICTION) WHICH SAYS: “A GENERAL RELEASE
        DOES NOT EXTEND TO CLAIMS WHICH THE CREDITOR DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT THE TIME
        OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH
        THE DEBTOR.”
      </p>
      <p>
        <strong>Unsolicited material. </strong>We always appreciate feedback or other suggestions. &nbsp;If we decide to
        use them, we may do so without any restrictions or obligation to compensate you. Furthermore, We are under no
        obligation to keep them confidential.
      </p>
      <p>
        <strong>Updating Terms. </strong>We may make Changes to the Platform or Services, these Terms, any Service Terms
        or our policies at any time and from time to time at our sole discretion, including to make Changes so that they
        accurately reflect the Platform, Services, and policies and to bring to you the best possible service. You must
        review these Terms any Service Terms carefully and to check them periodically for any updates or Changes and to
        ensure that you understand the terms and conditions that apply when you access or use the Platform or Services.
        &nbsp;Unless otherwise required by law, if we make a material Change or amendment to these Terms, any Service
        Terms our Platform, Services or our policies we will use reasonable efforts to provide a notice of such Changes
        or amendments on the Platform or through the Platform by posting the revised Terms on the Platform, or updating
        the “last updated” date at the beginning of these Terms, and such Changes or amendments will be effective
        automatically upon the posting of such notification. You agree that all agreements, notices, disclosures and
        other communications we provide to you electronically satisfy any legal requirement that such communications be
        in writing. Notwithstanding the terms of this paragraph, no revisions to the Terms will apply to any dispute
        between you and us that arose prior to the effective date of such revision. We may, from time to time, release
        new versions of the Platform, remove, release or introduce new tools, products, services, functionalities, or
        features for the Platform, which will be deemed to be a part of the Platform and shall be subject to these
        Terms, and any additional Terms as may apply to such additional versions, tools, products, services,
        functionalities, or features shall be deemed to be a part of your agreement with us.
      </p>
      <p>
        IF ANY PROVISION OF THESE TERMS OR OUR POLICIES, OR ANY FUTURE CHANGES OR AMENDMENTS ARE UNACCEPTABLE TO YOU, DO
        NOT USE OR CONTINUE TO ACCESS THE PLATFORM OR ANY SERVICES AND DO NOT CREATE AN ACCOUNT. YOUR CONTINUED ACCESS
        OR USE OF THE PLATFORM OR ANY SERVICE FOLLOWING THE POSTING OF ANY NOTICE OF ANY CHANGE OR AMENDMENT TO THESE
        TERMS SHALL CONSTITUTE YOUR ACCEPTANCE AND AGREEMENT TO SUCH CHANGE OR AMENDMENT.
      </p>
      <p>
        <strong>Modifications to the Platform or Services. </strong>We reserve the right in our sole discretion to
        modify, suspend, or discontinue, temporarily or permanently, the Platform or Services at any time and without
        any liability.
      </p>
      <p>
        <strong> PAL TERMS OF SERVICE</strong>
      </p>
      <p>
        The following terms of service govern your use of our &nbsp;PAL Service and provide information about PAL. To
        use our &nbsp;PAL Service, you must agree to these &nbsp;PAL Terms of Service (“ PAL Terms”) and each of the
        terms and conditions of the iR Studio Terms that refer to our Services and/or the &nbsp;PAL Terms which
        collectively form a legal and binding agreement between Infinite Reality, Inc. (“Company”) and you the user
        (“You” or “Your”). The terms and conditions of the iR Studio Terms that refer to our Services and/or the PAL
        Terms are incorporated by reference into these &nbsp;PAL Terms. Your use of the PAL Service is your acceptance
        of these collective terms and conditions and your agreement to be bound by them and the terms of our Privacy
        Policy. &nbsp;{' '}
      </p>
      <p>
        Capitalized Terms used in the &nbsp;PAL Terms but not defined shall have the meanings ascribed to them in the iR
        Studio Terms.{' '}
      </p>
      <p>
        If using &nbsp;PAL as an additional product to an iR Studio Plan, You must also agree to all of the iR Studio
        Terms which together with the &nbsp;PAL Terms form a legal and binding agreement between the Company and You.{' '}
      </p>
      <p>
        If using &nbsp;PAL with a Third-Party Service, You must agree to these &nbsp;PAL Terms as well as any additional
        terms and conditions of the Third-Party Service.
      </p>
      <p>
        We also encourage You to read our{' '}
        <a className="text-[#009bee] underline" href="https://www.ir.world/privacy-policy" target="_blank">
          Privacy Policy
        </a>{' '}
        (and any privacy notices presented in connection with a Service) to better understand what information we
        collect and how You can <a href="https://account.google.com/">manage Your information</a>.
      </p>
      <p>
        <strong>Age requirements. </strong> PAL IS AVAILABLE ONLY TO USERS WHO CAN FORM A LEGALLY BINDING CONTRACT UNDER
        APPLICABLE LAW. BY VISITING THE WEBSITE OR USING THE SERVICES, YOU REPRESENT AND WARRANT THAT YOU ARE (I) AT
        LEAST EIGHTEEN (18) YEARS OF AGE, (II) OTHERWISE RECOGNIZED AS BEING ABLE TO FORM LEGALLY BINDING CONTRACTS
        UNDER APPLICABLE LAW, AND/OR (III) NOT A PERSON BARRED FROM PURCHASING OR RECEIVING THE SERVICESUNDER THE LAWS
        OF THE UNITED STATES OR OTHER APPLICABLE JURISDICTION.
      </p>
      <p>
        <strong> Your content.</strong> You may provide input to the PAL Service (“Input”), and receive output from the
        &nbsp;PAL Service based on the Input (“Output”). Input and Output are collectively “Content.” You are
        responsible for Content, including ensuring that it does not violate any applicable law or these Terms
        (including the PAL Terms), or any Third-Party Service terms. You represent and warrant that You have all rights,
        licenses, and permissions needed to provide Input to our &nbsp;PAL Service and for your Content.
      </p>
      <p>
        <strong>Ownership of content.</strong> As between You and Company, and to the extent permitted by applicable
        law, You retain Your ownership rights in Input and own the Output.{' '}
      </p>
      <p>
        <strong>Similarity of content.</strong> Due to the nature of our PAL and artificial intelligence generally, Your
        Output may not be unique and other users may receive similar output from our &nbsp;PAL.{' '}
      </p>
      <p>
        <strong>Our use of content.</strong> We may use Content to provide, maintain, develop, and improve our&nbsp;PAL,
        comply with applicable law, enforce these Terms or other terms and policies, and keep our PAL safe.{' '}
      </p>
      <p>
        <strong>Accuracy.</strong> Artificial intelligence and machine learning are rapidly evolving fields of study. We
        are constantly working to improve our &nbsp;PAL to make the Product more accurate, reliable, safe, and
        beneficial. Given the probabilistic nature of machine learning, use of our PAL &nbsp;may, in some situations,
        result in Output that does not accurately reflect real people, places, or facts.{' '}
      </p>
      <p>When You use our&nbsp;PAL You understand and agree:</p>
      <ul role="list">
        <li>
          Output may not always be accurate. You should not rely on Output from our PAL as a sole source of truth or
          factual information, or as a substitute for professional advice.
        </li>
        <li>
          You must evaluate Output for accuracy and appropriateness for Your use case, including using human review as
          appropriate, before using or sharing Output from the PAL.
        </li>
        <li>
          You must not use any Output relating to a person for any purpose that could have a legal or material impact on
          that person, such as making credit, educational, employment, housing, insurance, legal, medical, or other
          important decisions about them.{' '}
        </li>
        <li>
          Our &nbsp;PAL may provide incomplete, incorrect, or offensive Output that does not represent Company’s views.
          If Output references any Third-Party Services or products, it doesn’t mean the third party endorses or is
          affiliated with Company.
        </li>
      </ul>
      <p>
        <strong>Use restrictions. </strong>You may not use &nbsp;PAL to develop machine learning models or related
        technology.{' '}
      </p>
      <p>
        <strong>Discontinuation of &nbsp;PAL. </strong>We may decide to discontinue&nbsp;PAL at any time and for any
        reason.{' '}
      </p>
      <p>
        <strong>Our IP rights. </strong>As between You and Company, we own all rights, title, and interest in and to
        PAL.{' '}
      </p>
      <p>
        <strong>The &nbsp;PAL license</strong>. We grant to you a non-exclusive, limited, revocable, non-transferable,
        non-assignable, non-sublicensable and personal right and license to access and use the PAL Service, subject to
        the additional terms of your applicable Plan or Service subscription (the “ PAL License”). This &nbsp;PAL
        License is not for sale or for redistribution of any kind and the PAL License is granted to you for the sole
        purpose of enabling you to use the&nbsp;PAL Service as permitted by these &nbsp;PAL Terms.
      </p>
      <p>
        <strong>Billing</strong>. You agree and authorize Company or its affiliates or authorized agents, as applicable,
        to automatically bill and charge You for the use of PAL using Your selected payment method (acceptable to
        Infinite Reality) in regular intervals (such as monthly or annually) using our third-party payment processor,
        Stripe (“Payment Processor”), and all payments will be processed in accordance with Stripe’s terms of service
        and privacy policy. You agree to pay us, through the Payment Processor, all charges at the prices then in effect
        for any purchase in accordance with the applicable payment terms. You agree to make payment using the payment
        method You provide with Your Account and You must notify Company of any Change in Your payment account
        information, either by updating Your Account or by contacting Customer Service. We reserve the right to correct,
        or to instruct our Payment Processor to correct, any errors or mistakes, even if payment has already been
        requested or received
      </p>
      <p>
        <strong>Fees For Third Party Services</strong>. Third Party Services that are used and/or purchased in
        conjunction with &nbsp;PAL may be subject to different refund or other policies that those Third-Party Services
        determine, and such Third-Party Services may be non-refundable. The purchase terms and conditions for such
        Third-Party Services may be displayed during the purchase process, such as through a link to the purchase terms
        and conditions. It is Your responsibility to verify Your ability to purchase, cancel or obtain a refund for a
        Third-Party Service. Unless otherwise stated in this Agreement, we do not offer refunds for purchases of
        Third-Party Services.
      </p>
      <p>
        <strong>Fee Changes and cancellation</strong>
        <em>.</em> Company reserves the right to impose Fees or Change its Fees at any time, and such Changes shall
        either be posted online and effective immediately without need for further notice to You, or notice shall be
        provided to You by email. New fees will not apply retroactively. If You do not agree with the Fee Changes, You
        have the right to reject the Change by canceling the Plan and any other additional products You purchased,
        before Your next payment date which can be done by logging into Your Account . If You do choose to cancel, You
        can do so at any time, and the cancellation will be effective at the end of the next billing term. All amounts
        are non-refundable unless otherwise noted.
      </p>
      <p>
        <strong>Auto-renewal. </strong> PAL is offered and charged as an automatic renewal unless otherwise specified.
        Unless prohibited by law, Company will automatically renew the applicable Service upon expiration of the then
        current term for a renewal period equal in time to the most recent Plan period, at the then current list price
        for such Plan, and charge the payment method associated with Your Account for such Plan. For example, if You are
        on a monthly Plan, each billable renewal period will be for one (1) month. By agreeing to these Terms, You
        authorize us to charge Your payment method on file with Your Account. You may cancel Your automatic renewal
        through Your Account, and such cancellation will be effective at the end of the next billing term.{' '}
      </p>
      <p>
        <strong>Taxes. </strong>All Fees are exclusive of applicable taxes, unless explicitly stated otherwise.
        <strong> </strong>You will be solely responsible to pay any and all sales, use, value-added and other taxes,
        duties, and assessments (except taxes on our net income) now or hereafter claimed or imposed by any governmental
        authority associated with Your use of PAL .
      </p>
      <p>
        <strong>Indemnification. </strong>To the maximum extent permitted by law,<strong> </strong>You agree to release,
        defend and indemnify us, as well as our respective officers, directors, members, managers, employees, equity
        holders, successors, agents, licensors, contractors, service providers, vendors, subsidiaries and affiliates
        (collectively the “ Company Indemnitees”), from any and all claims, demands, damages, losses and causes of
        action (including attorneys’ fees and court costs) of every kind or nature, known or unknown, foreseen or
        unforeseen, in law or equity whether in tort, contract or otherwise, including but not limited to damages to
        property or personal injury directly or indirectly arising out of or relating to: (1) Your access to or use of
        &nbsp;PAL or any other Services; (2) Your breach of these &nbsp;PAL Terms including any infringement of
        intellectual property rights; (3) Your negligence or misconduct; &nbsp;(4) any Input provided by You or anyone
        using Your Account; or (5) any Output and/or Content. &nbsp;
      </p>
      <p>
        BY ENTERING INTO THIS AGREEMENT, YOU EXPLICITLY WAIVE ANY PROTECTIONS, WHETHER ESTABLISHED BY LAW OR OTHERWISE,
        THAT WOULD LIMIT THE SCOPE OF THIS RELEASE TO ONLY THOSE CLAIMS YOU ARE AWARE OF OR SUSPECT EXIST AT THE TIME OF
        AGREEING TO THIS RELEASE. YOU AGREE TO COOPERATE FULLY AND REASONABLY IN OUR DEFENSE OR SETTLEMENT OF ANY CLAIM.
        WE RESERVE THE RIGHT, AT OUR REASONABLE DISCRETION, TO TAKE EXCLUSIVE CONTROL OVER THE DEFENSE AND SETTLEMENT OF
        ANY MATTER FOR WHICH YOU ARE PROVIDING INDEMNIFICATION.
      </p>
      <p>
        <strong>California residents.</strong> TO THE EXTENT APPLICABLE, YOU HEREBY WAIVE THE PROTECTIONS OF CALIFORNIA
        CIVIL CODE § 1542 (AND ANY ANALOGOUS LAW IN ANY OTHER APPLICABLE JURISDICTION) WHICH SAYS: “A GENERAL RELEASE
        DOES NOT EXTEND TO CLAIMS WHICH THE CREDITOR DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT THE TIME
        OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH
        THE DEBTOR.”
      </p>
      <p>
        <strong>Disclaimers</strong>. &nbsp; PAL includes experimental technology and may sometimes provide inaccurate,
        fictitious, or offensive Content that does not represent the views of Infinite Reality. Use discretion before
        relying on, publishing, or otherwise using Content and/or Output provided by &nbsp;PAL. Do not rely on &nbsp;PAL
        for medical, legal, financial, or other professional advice. Any Content regarding those topics is provided for
        informational purposes only and is not a substitute for advice from a qualified professional. Content and/ or
        Output created by &nbsp;PAL does not constitute medical treatment or diagnosis. Infinite Reality will have no
        liability for any recommendations made to potential users as part of &nbsp;PAL or its use through any
        Third-Party Services.
      </p>
      <p>
        {' '}
        PAL IS PROVIDED “AS IS.” EXCEPT TO THE EXTENT PROHIBITED BY LAW, WE AND OUR AFFILIATES AND LICENSORS MAKE NO
        WARRANTIES (EXPRESS, IMPLIED, STATUTORY OR OTHERWISE) WITH RESPECT TO iR PAL, AND DISCLAIM ALL WARRANTIES
        INCLUDING, BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, SATISFACTORY
        QUALITY, NON-INFRINGEMENT, AND QUIET ENJOYMENT, AND ANY WARRANTIES ARISING OUT OF ANY COURSE OF DEALING OR TRADE
        USAGE. WE DO NOT WARRANT THAT &nbsp;PAL WILL BE UNINTERRUPTED, ACCURATE OR ERROR FREE, OR THAT ANY CONTENT WILL
        BE SECURE OR NOT LOST OR ALTERED. YOU ACCEPT AND AGREE THAT ANY USE OF OUTPUTS FROM &nbsp;PAL IS AT YOUR SOLE
        RISK AND YOU WILL NOT RELY ON OUTPUT AS A SOLE SOURCE OF TRUTH OR FACTUAL INFORMATION, OR AS A SUBSTITUTE FOR
        PROFESSIONAL ADVICE.
      </p>
      <p>
        <strong>Limitation of liability</strong>. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL
        THE COMPANY BE LIABLE TO USER OR ANY THIRD-PARTY FOR ANY LOST PROFITS, LOSS OF GOODWILL OR ANY OTHER INTANGIBLE
        LOSS OR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO
        USER’S ACCESS TO OR USE OF, OR USER’S INABILITY TO ACCESS OR USE, THE PLATFORM OR SERVICES OR ANY MATERIALS OR
        CONTENT ON THE PLATFORM, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) STATUTE OR ANY OTHER
        LEGAL THEORY, AND WHETHER OR NOT ANY SUCH PARTIES HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGES OR LOSS.{' '}
      </p>
      <p>
        <strong>Liability Cap</strong>. To the maximum extent permitted by applicable law, You agree that Your sole
        remedy is to delete Your Account. In no event will the maximum aggregate liability arising out of Your use of
        the Platform or Services exceed U.S. Fifty Dollars (US$50.00). This limitation shall apply to any and all
        liabilities or causes of action however alleged or arising, including negligence, breach of contract, breach of
        warranty, or any other claim whether in tort, contract, or equity.
      </p>
      <p>
        <strong>
          PLEASE READ THE FOLLOWING &nbsp;SECTIONS CAREFULLY – THEY APPLY TO THE TERMS AND THE PAL TERMS AND THEY
          &nbsp;CONTAIN AN ARBITRATION AGREEMENT. IT MAY SIGNIFICANTLY AFFECT YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO
          FILE A LAWSUIT IN COURT. THEY ALSO CONTAIN A WAIVER TO JURY TRIAL, CLASS ACTION WAIVER AND OTHER TERMS.{' '}
        </strong>
      </p>
      <p>
        <strong>How we will handle disputes through arbitration. </strong>We would like an opportunity to address your
        concerns without a formal legal case. Before filing a claim against us, you agree to try to resolve the dispute
        informally by first contacting <a href="mailto:CustomerCare@theinfinitereality.com">Customer Care</a>. We will
        try to resolve the dispute informally by responding to you in writing via email.
      </p>
      <p>
        If you are a consumer and habitually reside in a Member State of the EU, the laws of that Member State will
        apply to any claim, cause of action, or dispute you have against us that arises out of or relates to these
        Terms, our Services or any of our other policies (“Claim”), and you may resolve your claim in any competent
        court in that Member State that has jurisdiction over the claim. In all other cases the following shall apply,
        except to the extent that you are a consumer and the law of the country in which you reside does not permit the
        following to apply.
      </p>
      <p>
        You and we agree that any dispute, claim or controversy arising out of or relating in any way to these Terms,
        PAL Terms, Platform, Services, or our{' '}
        <a className="text-[#009bee] underline" href="https://www.ir.world/privacy-policy" target="_blank">
          Privacy Policy
        </a>{' '}
        (a “Dispute”) shall be determined by binding arbitration or in small claims court. Arbitration is more informal
        than a lawsuit in court. Arbitration uses a neutral arbitrator instead of a judge or jury, allows for more
        limited discovery than in court, and is subject to very limited review by courts. You may choose to be
        represented by a lawyer in arbitration or proceed without one. You acknowledge that, by agreeing to these Terms,
        the U.S. Federal Arbitration Act governs the interpretation and enforcement of this provision, and that you and
        we are each waiving the right to a trial by jury or to participate in a class action. You also agree that any
        Dispute in connection with these Terms, the Platform, Services or our{' '}
        <a className="text-[#009bee] underline" href="https://www.ir.world/privacy-policy" target="_blank">
          Privacy Policy
        </a>{' '}
        will be governed by the laws of the State of New York and the United States of America. This provision shall
        survive any Change or termination of these Terms.
      </p>
      <p>
        If you elect to seek arbitration or file a small claim court action, you must first send to us, by certified
        mail, a written notice of your claim (“Notice”). The Notice to us must be addressed to: Legal Counsel, Infinite
        Reality, Inc., 16 Washington Street, P.O. Box 13, Norwalk, CT 06854. If we initiate arbitration, we will send a
        written notice to an email address you have previously provided to us, if available. A notice, whether sent by
        you or by us, must (a) describe the nature and basis of the claim or dispute; and (b) set forth the specific
        relief sought (“Demand”). If you and we do not reach an agreement to resolve the claim within 30 days after the
        notice is received, you or we may commence an arbitration proceeding or file a claim in small claims court.
        Arbitration forms can be downloaded from <a href="https://www.jamsadr.com/">jamsadr.com</a>. If you are required
        to pay a filing fee, after we receive notice that you have commenced arbitration, we will promptly reimburse you
        for your payment of the filing fee, unless your claim is for greater than US$10,000 or the arbitrator determines
        the claims are frivolous, in which event you will be responsible for filing fees.
      </p>
      <p>
        The arbitration shall be administered by JAMS or its successor (“JAMS”) and conducted in accordance with the
        JAMS Streamlined Arbitration Rules And Procedures in effect at the time the Arbitration is initiated or, if the
        amount in controversy exceeds $100,000, in accordance with the JAMS Comprehensive Arbitration Rules And
        Procedures then in effect (respectively, the “JAMS Rules”), except to the extent that the JAMS Rules are
        inconsistent with these Terms or the class action waiver described below. The arbitrator shall be selected in
        accordance with the JAMS Rules or the mutual agreement of the parties and shall follow New York law in
        adjudicating the Dispute. The arbitrator, and not any federal, state or local court or agency, shall have
        exclusive authority to resolve all Disputes arising out of or relating to the interpretation, applicability,
        enforceability or formation of these Terms, including, but not limited to any claim that all or any part of
        these Terms is void or voidable, or whether a claim is subject to arbitration. The arbitrator shall be empowered
        to grant whatever relief would be available in a court under law or in equity, subject to the limitations set
        forth herein. The arbitrator shall issue a reasoned written decision setting forth the arbitrator’s complete
        determination of the Dispute and the factual findings and legal conclusions relevant to it. The arbitrator’s
        award shall be binding on the parties and may be entered as a judgment in any court of competent jurisdiction.
      </p>
      <p>
        The arbitrator is bound by these Terms and all issues are for the arbitrator to decide, including issues
        relating to the scope and enforceability of this arbitration agreement. Unless you and we agree otherwise, any
        arbitration hearings will take place in a location determined by JAMS and not more than 100 miles from your
        home. If your claim is for US$10,000 or less, we agree that you may choose whether the arbitration will be
        conducted solely on the basis of documents submitted to the arbitrator, through a telephonic hearing, or by an
        in-person hearing as established by the JAMS Rules. If your claim exceeds US$10,000, the right to a hearing will
        be determined by the JAMS Rules. If the arbitration will be conducted solely based on submitted documents, the
        arbitrator’s decision and award will be made and delivered within six (6) months of the selection of the
        arbitrator, unless extended by the arbitrator. Except as expressly set forth herein, the award of all filing,
        administration and arbitrator fees will be governed by the JAMS Rules.
      </p>
      <p>
        Furthermore, unless both you and we agree otherwise, the arbitrator may not consolidate more than one person’s
        claims with your claims and may not otherwise preside over any form of a representative or class proceeding. If
        this specific provision is found to be unenforceable, then the entirety of this arbitration provision shall be
        null and void. The arbitrator may award declaratory or injunctive relief only in favor of the individual party
        seeking relief and only to the extent necessary to provide relief warranted by that party’s individual claim.
      </p>
      <p>
        Notwithstanding the foregoing, you and we both agree that you or we may bring suit in court to enjoin
        infringement or other misuse of intellectual property rights, or efforts to interfere with our offering or
        engaging with our Platform or Services in unauthorized ways (for example automated ways). In the event a court
        or arbitrator having jurisdiction finds any portion of these Terms unenforceable, that portion shall not be
        effective, and the remainder of the Agreement shall remain effective. No waiver, express or implied, by either
        party of any breach of or default under these Terms will constitute a continuing waiver of such breach or
        default or be deemed to be a waiver of any preceding or subsequent breach or default.{' '}
      </p>
      <p>
        <strong>Governing law; Venue for non-arbitrable disputes</strong>. These Terms, the PAL Terms and our policies
        are governed by the laws of the State of New York, USA without regard to conflict of law principles. Any
        disputes that are not subject to the arbitration terms contained in these Terms or that may be severed from any
        arbitration may only be litigated in small claims court or in the federal or state courts of New York County in
        the State of New York, USA and you and we consent to personal and exclusive jurisdiction in these courts and
        agree to waive any jurisdictional, venue, or inconvenient forum objections to such courts (without affecting
        either parties rights to remove a case to federal court if permissible.) Any law or regulation which provides
        that the language of a contract shall be construed against the drafter will not apply to these Terms. This
        paragraph will be interpreted as broadly as applicable law permits.
      </p>
      <p>
        If either Party brings an action against the other Party to enforce its rights under these Terms or the PAL
        Terms, the prevailing Party shall be entitled to recover its reasonable costs and expenses incurred in
        connection with such action and all appeals of such action, including reasonable attorneys’ fees and costs. The
        prevailing Party shall be the Party that most nearly obtains the relief sought. Failure by either Party to
        exercise any of its rights under, or to enforce any provision of, these Terms or PAL Terms will not be deemed a
        waiver or forfeiture of such rights or ability to enforce such provision. If any provision of these Terms or PAL
        Terms &nbsp;is held by a court of competent jurisdiction to be illegal, invalid or<strong> </strong>
        unenforceable, such provision will be amended to achieve as nearly as possible the same economic effect of the
        original provision and the remainder of these Terms and PAL Terms will remain in full force and effect. Your
        rights and remedies hereunder will be deemed cumulative and not exclusive of any other right or remedy conferred
        by these Terms or by law or equity. No joint venture, partnership, employment, or agency relationship exists
        between you or us because of these Terms, the PAL Terms or use of the Platform or Services. Infinite Reality
        reserves the right to perform its obligations from locations and/or through use of affiliates, subsidiaries,
        contractors and subcontractors, worldwide, provided that Infinite Reality will be responsible for such parties.
        You agree that Infinite Reality may refer to you by a trade name and logo if running a business, and may briefly
        describe your business, if applicable, in Infinite Reality marketing materials and websites. Infinite Reality
        may give notice to you by electronic mail to your email address in your Account information, or by written
        communication sent by first class mail or pre-paid post your address in your Account information. You may give
        notice to Infinite Reality at any time by any letter delivered by nationally recognized overnight delivery
        service or first-class postage prepaid mail to Infinite Reality, Inc., Attn.: Legal Department, 16 Washington
        Street, P.O. Box 13 Norwalk, CT 06854. Notice under this<strong> </strong>Agreement shall be deemed given when
        received, if personally delivered; when receipt is electronically confirmed, if transmitted by email; the day
        after it is sent, if sent for next-day delivery by a recognized overnight delivery service; and upon receipt, if
        sent by certified or registered mail, return receipt requested.
      </p>
      <p>
        <strong>Platform operation; United Nations Convention on Contracts</strong>. The Platform is operated by the
        Company in the United States of America. If you choose to access the Platform or any Services from locations
        outside the United States you do so at your own risk and are responsible for compliance with applicable laws,
        rules and regulations. You and the Company agree that the United Nations Convention on Contracts for the
        International Sale of Goods will not apply to the interpretation or construction of these Terms or the PAL
        Terms.
      </p>
      <p>
        <strong>As is and as available</strong>. THE PLATFORM AND OUR SERVICES ARE &nbsp;PROVIDED ON AN “AS IS” AND “AS
        AVAILABLE” BASIS AND YOUR USE IS AT YOUR OWN RISK. WE MAKE NO GUARANTEES THAT THEY ALWAYS WILL BE SAFE, SECURE
        OR ERROR-FREE OR THAT THEY WILL FUNCTION WITHOUT DISRUPTIONS, DELAYS OR IMPERFECTIONS, TO THE MAXIMUM EXTENT
        PERMITTED BY LAW WE ALSO DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING THE IMPLIED WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
      </p>
      <p>
        <strong>No control or responsibility</strong>. We do not control or direct what you or others do or say, and we
        are not responsible for actions or conduct (whether online or offline) or any Content shared (including
        offensive, inappropriate, obscene, unlawful, and other objectionable Content) on the Platform or arising from
        the use of our Services.
      </p>
      <p>
        <strong>Limitation of liability</strong>. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL
        THE COMPANY BE LIABLE TO USER OR ANY THIRD-PARTY FOR ANY LOST PROFITS, LOSS OF GOODWILL OR ANY OTHER INTANGIBLE
        LOSS OR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO
        USER’S ACCESS TO OR USE OF, OR USER’S INABILITY TO ACCESS OR USE, THE PLATFORM,SERVICES OR ANY MATERIALS OR
        CONTENT ON THE PLATFORM, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) STATUTE OR ANY OTHER
        LEGAL THEORY, AND WHETHER OR NOT ANY SUCH PARTIES HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGES OR LOSS.{' '}
      </p>
      <p>
        <strong>Liability Cap</strong>. To the maximum extent permitted by applicable law, you agree that your sole
        remedy is to delete your Accounts on the Platform or Services. In no event will the maximum aggregate liability
        arising out of your use of the Platform or Services exceed U.S. Fifty Dollars (US$50.00). This limitation shall
        apply to any and all liabilities or causes of action however alleged or arising, including negligence, breach of
        contract, breach of warranty, or any other claim whether in tort, contract, or equity.
      </p>
      <p>
        <strong>Exclusion of damages.</strong> &nbsp;INFINITE REALITY WILL NOT BE LIABLE FOR ANY LOSS OF PROFITS,
        GOODWILL OR BUSINESS INTERRUPTION, LOSS OF ANTICIPATED SAVINGS, LOSS OF USE, COST OF SUBSTITUTE GOODS OR
        SERVICES, WORK STOPPAGE OR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE OR CONSEQUENTIAL DAMAGES, INCLUDING
        DAMAGES FOR LOSS OF REVENUES OR PROFITS, LOSS OF USE, BUSINESS INTERRUPTION, OR LOSS OF DATA, WHETHER IN AN
        ACTION IN CONTRACT OR TORT, EVEN IF IT HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES ARISING FROM YOUR USE
        OF OUR PLATFORM, OUR SERVICES OR OTHERWISE.
      </p>
      <p>
        <strong>One year limitation</strong>. USER AND COMPANY AGREE THAT ANY CAUSE OF ACTION ARISING OUT OF OR RELATED
        TO THE PLATFORM OR SERVICES MUST COMMENCE WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION ARISES OR IT IS
        PERMANENTLY BARRED.
      </p>
      <p>
        <strong>California consumer rights</strong>. If you are a California state resident, in accordance with Cal.
        Civ. Code § 1789.3, you may report complaints to the Complaint Assistance Unit of the Division of Consumer
        Services of the California Department of Consumer Affairs by contacting them in writing at 1625 North Market
        Blvd., Suite N 112 Sacramento, CA 95834, or by telephone at (800) 952-5210.
      </p>
      <p>
        <strong>Waiver of jury trial. </strong>YOU AGREE TO WAIVE (GIVE UP) YOUR RIGHT TO A TRIAL BY JURY.
      </p>
      <p>
        <strong>Class action waiver.</strong> YOU AGREE THAT YOU MAY BRING CLAIMS AGAINST US ONLY IN YOUR INDIVIDUAL
        CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS ACTION LAWSUIT OR REPRESENTATIVE
        PROCEEDING, CONSOLIDATED ACTION, OR PRIVATE ATTORNEY GENERAL ACTION. THIS MEANS THAT YOU CANNOT SEEK TO ASSERT
        CLASS OR REPRESENTATIVE CLAIMS AGAINST US EITHER IN COURT OR IN ARBITRATION AND NO RELIEF CAN BE AWARDED ON A
        CLASS OR REPRESENTATIVE BASIS.
      </p>
      <p>
        <strong>Enforceability</strong>. If any term, clause, or provision of these Terms including the Concierge Terms
        is held invalid or unenforceable under applicable law, that term, clause, or provision will be severable from
        the Terms or PAL Terms as applicable and will not affect the validity or enforceability of any remaining part of
        that term, clause or provision or any other term, clause or provision of these Terms or PAL Terms.{' '}
      </p>
      <p>
        <strong>Questions.</strong> If you have questions about these Terms or the PAL Terms, you can contact us at the
        address below:
      </p>
      <p>Infinite Reality, Inc. </p>
      <p>Attn: Customer Care</p>
      <p>16 Washington St.</p>
      <p>P.O. Box 13</p>
      <p>Norwalk, CT 06854</p>
    </div>
  )
}

const ToS = ({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) => {
  const { t } = useTranslation()
  const isAcceptEnabled = useHookstate(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleScroll = (e) => {
    const obj = ref.current
    if (!obj) return

    if (obj.scrollHeight - obj.scrollTop - obj.clientHeight < 1) {
      isAcceptEnabled.set(true)
    } else {
      isAcceptEnabled.set(false)
    }
  }

  const onSubmit = () => {
    onAccept()
    PopoverState.hidePopupover()
  }

  const onClose = () => {
    onDecline()
    PopoverState.hidePopupover()
  }

  return (
    <div className="relative z-50 w-[50vw] min-w-[720px] max-w-2xl overflow-y-auto rounded-2xl bg-surface-1">
      <div className="relative rounded-lg shadow">
        <ModalHeader title={t('user:usermenu.profile.termsOfService')} onClose={onClose} />
        <div className="h-fit max-h-[60vh] w-full overflow-y-auto px-10 py-6" ref={ref} onScroll={handleScroll}>
          <ToSContents />
        </div>

        <ModalFooter
          closeButtonText="Decline"
          submitButtonText="Accept"
          closeButtonDisabled={false}
          submitButtonDisabled={!isAcceptEnabled.value}
          onCancel={onClose}
          onSubmit={onSubmit}
          showCloseButton={true}
        />
      </div>
    </div>
  )
}

export default ToS
