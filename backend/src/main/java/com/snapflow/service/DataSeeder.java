package com.snapflow.service;

import com.snapflow.entity.Package;
import com.snapflow.entity.*;
import com.snapflow.enums.*;
import com.snapflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final AddOnRepository addOnRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final PhotographerAssignmentRepository assignmentRepository;
    private final EquipmentAllocationRepository allocationRepository;
    private final PaymentRepository paymentRepository;
    private final GalleryRepository galleryRepository;
    private final PhotoRepository photoRepository;
    private final FeedbackRepository feedbackRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final SystemSettingRepository settingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {

        log.info("Checking database seed data...");

        seedUsers();
        seedPackages();
        seedAddOns();
        seedEquipment();
        seedSettings();
        seedBookingsAndRelatedData();

        log.info("Database seeding completed successfully.");
    }

    // =========================================================
    // USERS
    // =========================================================

    private void seedUsers() {

        createUserIfAbsent(
                "Thisara Perera",
                "thisara@gmail.com",
                "thisara@2005",
                "0771234567",
                Role.COMPANY_DIRECTOR
        );

        createUserIfAbsent(
                "Nadun Fernando",
                "nadun@gmail.com",
                "nadun@2006",
                "0712345678",
                Role.OPERATIONS_MANAGER
        );

        createUserIfAbsent(
                "Anupa Silva",
                "anupa@gmail.com",
                "anupa@2005",
                "0723456789",
                Role.OPERATIONS_MANAGER
        );

        createUserIfAbsent(
                "Sahan Dissanayake",
                "sahan@gmail.com",
                "sahan@2004",
                "0754567890",
                Role.CUSTOMER_RELATIONS_OFFICER
        );

        createUserIfAbsent(
                "Nethuli Jayasinghe",
                "nethuli@gmail.com",
                "nethuli@2005",
                "0765678901",
                Role.PHOTOGRAPHER
        );

        createUserIfAbsent(
                "Kavindu Wickrama",
                "kavindu@gmail.com",
                "kavindu@2005",
                "0786789012",
                Role.PHOTOGRAPHER
        );

        createUserIfAbsent(
                "Finance Executive",
                "finance@gmail.com",
                "finance@2005",
                "0112345679",
                Role.FINANCE_EXECUTIVE
        );

        createUserIfAbsent(
                "Afrith Ahamed",
                "afrith@gmail.com",
                "afrith@2005",
                "0707890123",
                Role.CUSTOMER
        );

        createUserIfAbsent(
                "Dinithi Kumari",
                "dinithi@gmail.com",
                "dinithi@2005",
                "0718901234",
                Role.CUSTOMER
        );
    }

    /**
     * Creates the demo user if missing.
     *
     * If the user already exists, this method synchronizes the demo
     * password and role so the quick-demo login credentials continue
     * working even after changing databases.
     */
    private User createUserIfAbsent(
            String name,
            String email,
            String plainPassword,
            String phone,
            Role role
    ) {

        return userRepository.findByEmailIgnoreCase(email)
                .map(existingUser -> {

                    boolean changed = false;

                    // ---------------------------------------------
                    // Synchronize password
                    // ---------------------------------------------
                    if (existingUser.getPassword() == null
                            || !passwordEncoder.matches(
                            plainPassword,
                            existingUser.getPassword()
                    )) {

                        existingUser.setPassword(
                                passwordEncoder.encode(plainPassword)
                        );

                        changed = true;

                        log.info(
                                "Updated demo password for user: {}",
                                email
                        );
                    }

                    // ---------------------------------------------
                    // Synchronize role
                    // ---------------------------------------------
                    if (existingUser.getRole() != role) {

                        existingUser.setRole(role);
                        changed = true;

                        log.info(
                                "Updated demo role for user: {} -> {}",
                                email,
                                role
                        );
                    }

                    // ---------------------------------------------
                    // Ensure demo account is active
                    // ---------------------------------------------
                    if (!existingUser.isActive()) {

                        existingUser.setActive(true);
                        changed = true;

                        log.info(
                                "Reactivated demo user: {}",
                                email
                        );
                    }

                    // ---------------------------------------------
                    // Keep name synchronized
                    // ---------------------------------------------
                    if (existingUser.getFullName() == null
                            || !existingUser.getFullName().equals(name)) {

                        existingUser.setFullName(name);
                        changed = true;
                    }

                    // ---------------------------------------------
                    // Keep phone synchronized
                    // ---------------------------------------------
                    if (phone != null
                            && !phone.equals(existingUser.getPhone())) {

                        existingUser.setPhone(phone);
                        changed = true;
                    }

                    if (changed) {
                        return userRepository.save(existingUser);
                    }

                    return existingUser;
                })
                .orElseGet(() -> {

                    User newUser = User.builder()
                            .fullName(name)
                            .email(email.toLowerCase())
                            .password(
                                    passwordEncoder.encode(plainPassword)
                            )
                            .phone(phone)
                            .role(role)
                            .active(true)
                            .build();

                    log.info(
                            "Created demo user: {}",
                            email
                    );

                    return userRepository.save(newUser);
                });
    }

    // =========================================================
    // PACKAGES
    // =========================================================

    private void seedPackages() {

        createPackageIfAbsent(
                "Essential Wedding",
                "Ideal for intimate weddings and ceremonies. Focuses on key moments.",
                new BigDecimal("85000.00"),
                6,
                "1 Photographer, 300+ edited photos, Online gallery, USB drive",
                "Wedding"
        );

        createPackageIfAbsent(
                "Premium Wedding",
                "Complete wedding coverage with engagement session and luxury album.",
                new BigDecimal("145000.00"),
                10,
                "2 Photographers, Engagement shoot, 500+ edited photos, Premium album, Online gallery",
                "Wedding"
        );

        createPackageIfAbsent(
                "Luxury Wedding",
                "All-day master coverage with drone captures and cinematic highlights.",
                new BigDecimal("225000.00"),
                12,
                "2 Photographers + Videographer, Pre-wedding shoot, 700+ photos, Luxury album, Highlight video, Online gallery",
                "Wedding"
        );

        createPackageIfAbsent(
                "Corporate Event",
                "Professional coverage for conferences, seminars, and corporate celebrations.",
                new BigDecimal("55000.00"),
                4,
                "1 Photographer, 200+ edited photos, Same-day selection, Online gallery",
                "Corporate"
        );

        createPackageIfAbsent(
                "Birthday & Parties",
                "Vibrant captures for milestone birthdays, anniversaries, and family parties.",
                new BigDecimal("35000.00"),
                3,
                "1 Photographer, 150+ edited photos, Online gallery",
                "Social"
        );

        createPackageIfAbsent(
                "Portrait Session",
                "Studio or outdoor portrait session for individuals, couples, or graduation.",
                new BigDecimal("25000.00"),
                2,
                "1 Photographer, 50+ edited photos, Online gallery, Print rights",
                "Portrait"
        );
    }

    private void createPackageIfAbsent(
            String name,
            String desc,
            BigDecimal price,
            int hours,
            String features,
            String category
    ) {

        if (!packageRepository.existsByNameIgnoreCase(name)) {

            packageRepository.save(
                    Package.builder()
                            .name(name)
                            .description(desc)
                            .price(price)
                            .durationHours(hours)
                            .features(features)
                            .category(category)
                            .active(true)
                            .build()
            );
        }
    }

    // =========================================================
    // ADD-ONS
    // =========================================================

    private void seedAddOns() {

        createAddOnIfAbsent(
                "Extra Photographer",
                "Add a second angle shooter to capture more candid moments.",
                new BigDecimal("25000.00")
        );

        createAddOnIfAbsent(
                "Drone Photography",
                "Stunning aerial perspectives of your venue and guests.",
                new BigDecimal("18000.00")
        );

        createAddOnIfAbsent(
                "Same Day Edit",
                "10 teaser edited images delivered on event day for social sharing.",
                new BigDecimal("15000.00")
        );

        createAddOnIfAbsent(
                "Premium Album",
                "Handmade lay-flat flush-mount 30-page leather album.",
                new BigDecimal("22000.00")
        );

        createAddOnIfAbsent(
                "Highlight Video (3-5 min)",
                "Cinematic 4K edited video highlight reel with soundtrack.",
                new BigDecimal("35000.00")
        );

        createAddOnIfAbsent(
                "Raw Files",
                "Complete archive of uncompressed RAW files delivered on hard disk.",
                new BigDecimal("12000.00")
        );
    }

    private void createAddOnIfAbsent(
            String name,
            String desc,
            BigDecimal price
    ) {

        if (!addOnRepository.existsByNameIgnoreCase(name)) {

            addOnRepository.save(
                    AddOn.builder()
                            .name(name)
                            .description(desc)
                            .price(price)
                            .active(true)
                            .build()
            );
        }
    }

    // =========================================================
    // EQUIPMENT
    // =========================================================

    private void seedEquipment() {

        createEquipmentIfAbsent(
                "Canon EOS R5",
                "Camera",
                "CN-R5-001"
        );

        createEquipmentIfAbsent(
                "Canon EOS R6",
                "Camera",
                "CN-R6-002"
        );

        createEquipmentIfAbsent(
                "Sony A7IV",
                "Camera",
                "SN-A7-003"
        );

        createEquipmentIfAbsent(
                "Canon 24-70mm f/2.8",
                "Lens",
                "LN-2470-001"
        );

        createEquipmentIfAbsent(
                "Canon 70-200mm f/2.8",
                "Lens",
                "LN-70200-001"
        );

        createEquipmentIfAbsent(
                "Godox AD200",
                "Lighting",
                "LT-AD200-001"
        );

        createEquipmentIfAbsent(
                "DJI Mavic 3",
                "Drone",
                "DR-M3-001"
        );
    }

    private void createEquipmentIfAbsent(
            String name,
            String cat,
            String serial
    ) {

        if (!equipmentRepository
                .existsBySerialNumberIgnoreCase(serial)) {

            equipmentRepository.save(
                    Equipment.builder()
                            .name(name)
                            .category(cat)
                            .serialNumber(serial)
                            .status(
                                    EquipmentStatus.AVAILABLE
                            )
                            .notes(
                                    "Good condition, verified."
                            )
                            .build()
            );
        }
    }

    // =========================================================
    // SYSTEM SETTINGS
    // =========================================================

    private void seedSettings() {

        createSettingIfAbsent(
                "site_name",
                "Lanka Moments (Pvt) Ltd",
                "Company branding name"
        );

        createSettingIfAbsent(
                "contact_email",
                "info@lankamoments.lk",
                "Primary contact email"
        );

        createSettingIfAbsent(
                "contact_phone",
                "+94 11 234 5678",
                "Primary telephone number"
        );

        createSettingIfAbsent(
                "address",
                "124 Galle Road, Colombo 03, Sri Lanka",
                "Company headquarters address"
        );
    }

    private void createSettingIfAbsent(
            String key,
            String val,
            String desc
    ) {

        if (settingRepository
                .findBySettingKey(key)
                .isEmpty()) {

            settingRepository.save(
                    SystemSetting.builder()
                            .settingKey(key)
                            .settingValue(val)
                            .description(desc)
                            .build()
            );
        }
    }

    // =========================================================
    // BOOKINGS + RELATED DATA
    // =========================================================

    private void seedBookingsAndRelatedData() {

        if (bookingRepository.count() > 0) {
            return;
        }

        User afrith =
                userRepository
                        .findByEmailIgnoreCase(
                                "afrith@gmail.com"
                        )
                        .orElse(null);

        User dinithi =
                userRepository
                        .findByEmailIgnoreCase(
                                "dinithi@gmail.com"
                        )
                        .orElse(null);

        User nethuli =
                userRepository
                        .findByEmailIgnoreCase(
                                "nethuli@gmail.com"
                        )
                        .orElse(null);

        User kavindu =
                userRepository
                        .findByEmailIgnoreCase(
                                "kavindu@gmail.com"
                        )
                        .orElse(null);

        User nadun =
                userRepository
                        .findByEmailIgnoreCase(
                                "nadun@gmail.com"
                        )
                        .orElse(null);

        User financeUser =
                userRepository
                        .findByEmailIgnoreCase(
                                "finance@gmail.com"
                        )
                        .orElse(null);

        Package premiumWedding =
                packageRepository
                        .findByNameIgnoreCase(
                                "Premium Wedding"
                        )
                        .orElse(null);

        Package corporateEvent =
                packageRepository
                        .findByNameIgnoreCase(
                                "Corporate Event"
                        )
                        .orElse(null);

        Package birthday =
                packageRepository
                        .findByNameIgnoreCase(
                                "Birthday & Parties"
                        )
                        .orElse(null);

        AddOn drone =
                addOnRepository
                        .findByNameIgnoreCase(
                                "Drone Photography"
                        )
                        .orElse(null);

        AddOn sameDay =
                addOnRepository
                        .findByNameIgnoreCase(
                                "Same Day Edit"
                        )
                        .orElse(null);

        Equipment r5 =
                equipmentRepository
                        .findBySerialNumberIgnoreCase(
                                "CN-R5-001"
                        )
                        .orElse(null);

        LocalDate today = LocalDate.now();

        // =====================================================
        // BOOKING 1
        // Completed Booking with Published Gallery & Review
        // =====================================================

        Booking b1 = Booking.builder()
                .bookingRef("SF-2026-0001")
                .customer(afrith)
                .photographyPackage(premiumWedding)
                .preferredPhotographer(nethuli)
                .eventDate(today.minusDays(7))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(19, 0))
                .venue(
                        "Shangri-La Ballroom, Colombo"
                )
                .eventType(
                        "Wedding Reception"
                )
                .specialRequests(
                        "Candid family shots preferred."
                )
                .status(
                        BookingStatus.COMPLETED
                )
                .packagePrice(
                        premiumWedding.getPrice()
                )
                .addOnsPrice(
                        drone.getPrice()
                )
                .additionalCharges(
                        BigDecimal.ZERO
                )
                .totalAmount(
                        premiumWedding
                                .getPrice()
                                .add(drone.getPrice())
                )
                .paidAmount(
                        premiumWedding
                                .getPrice()
                                .add(drone.getPrice())
                )
                .balanceAmount(
                        BigDecimal.ZERO
                )
                .internalNotes(
                        "VIP wedding client."
                )
                .build();

        List<BookingAddOn> b1AddOns =
                new ArrayList<>();

        b1AddOns.add(
                BookingAddOn.builder()
                        .id(
                                new BookingAddOnId(
                                        null,
                                        drone.getId()
                                )
                        )
                        .booking(b1)
                        .addOn(drone)
                        .unitPrice(
                                drone.getPrice()
                        )
                        .build()
        );

        b1.setBookingAddOns(b1AddOns);

        Booking savedB1 =
                bookingRepository.save(b1);

        // Photographer Assignment
        PhotographerAssignment pa1 =
                PhotographerAssignment.builder()
                        .booking(savedB1)
                        .photographer(nethuli)
                        .status(
                                AssignmentStatus.COMPLETED
                        )
                        .assignedBy(nadun)
                        .notes(
                                "Primary photographer for reception."
                        )
                        .build();

        assignmentRepository.save(pa1);

        // Payment
        Payment pay1 =
                Payment.builder()
                        .booking(savedB1)
                        .transactionReference(
                                "TXN-LM-001"
                        )
                        .amount(
                                savedB1.getTotalAmount()
                        )
                        .paymentType(
                                PaymentType.ADVANCE_DEPOSIT
                        )
                        .status(
                                PaymentStatus.VERIFIED
                        )
                        .verifiedBy(
                                financeUser
                        )
                        .verificationNotes(
                                "Bank transfer verified in full."
                        )
                        .build();

        paymentRepository.save(pay1);

        // Gallery
        Gallery gal1 =
                Gallery.builder()
                        .booking(savedB1)
                        .title(
                                "Afrith & Sarah - Royal Wedding"
                        )
                        .accessCode(
                                "ASWED261"
                        )
                        .status(
                                GalleryStatus.PUBLISHED
                        )
                        .proofSelectionEnabled(true)
                        .proofDeadline(
                                today.plusDays(10)
                        )
                        .publishedAt(
                                LocalDateTime
                                        .now()
                                        .minusDays(2)
                        )
                        .build();

        Gallery savedGal1 =
                galleryRepository.save(gal1);

        // Photos
        Photo p1 =
                Photo.builder()
                        .gallery(savedGal1)
                        .fileName(
                                "sample-wedding-1.jpg"
                        )
                        .originalFileName(
                                "Ceremony-Entrance.jpg"
                        )
                        .filePath(
                                "photos/sample-wedding-1.jpg"
                        )
                        .fileSize(
                                3421500L
                        )
                        .contentType(
                                "image/jpeg"
                        )
                        .caption(
                                "Grand entrance of bride and groom"
                        )
                        .isCover(true)
                        .isSelectedProof(true)
                        .build();

        Photo p2 =
                Photo.builder()
                        .gallery(savedGal1)
                        .fileName(
                                "sample-wedding-2.jpg"
                        )
                        .originalFileName(
                                "First-Dance.jpg"
                        )
                        .filePath(
                                "photos/sample-wedding-2.jpg"
                        )
                        .fileSize(
                                2984100L
                        )
                        .contentType(
                                "image/jpeg"
                        )
                        .caption(
                                "Magical first dance"
                        )
                        .isCover(false)
                        .isSelectedProof(true)
                        .build();

        Photo savedP1 =
                photoRepository.save(p1);

        photoRepository.save(p2);

        savedGal1.setCoverPhotoId(
                savedP1.getId()
        );

        galleryRepository.save(savedGal1);

        // Review
        Review rev1 =
                Review.builder()
                        .booking(savedB1)
                        .customer(afrith)
                        .rating(5)
                        .comment(
                                "Nethuli and the Lanka Moments team were sensational! The photos exceeded our highest expectations."
                        )
                        .photographer(nethuli)
                        .build();

        reviewRepository.save(rev1);

        // =====================================================
        // BOOKING 2
        // In Progress + Equipment Allocation
        // =====================================================

        Booking b2 =
                Booking.builder()
                        .bookingRef(
                                "SF-2026-0002"
                        )
                        .customer(dinithi)
                        .photographyPackage(
                                corporateEvent
                        )
                        .eventDate(today)
                        .startTime(
                                LocalTime.of(14, 0)
                        )
                        .endTime(
                                LocalTime.of(18, 0)
                        )
                        .venue(
                                "Cinnamon Grand Atrium, Colombo"
                        )
                        .eventType(
                                "Tech Summit Conference"
                        )
                        .status(
                                BookingStatus.IN_PROGRESS
                        )
                        .packagePrice(
                                corporateEvent.getPrice()
                        )
                        .addOnsPrice(
                                BigDecimal.ZERO
                        )
                        .additionalCharges(
                                BigDecimal.ZERO
                        )
                        .totalAmount(
                                corporateEvent.getPrice()
                        )
                        .paidAmount(
                                corporateEvent.getPrice()
                        )
                        .balanceAmount(
                                BigDecimal.ZERO
                        )
                        .build();

        Booking savedB2 =
                bookingRepository.save(b2);

        PhotographerAssignment pa2 =
                PhotographerAssignment.builder()
                        .booking(savedB2)
                        .photographer(kavindu)
                        .status(
                                AssignmentStatus.IN_PROGRESS
                        )
                        .assignedBy(nadun)
                        .notes(
                                "Keynote and panel session coverage."
                        )
                        .build();

        assignmentRepository.save(pa2);

        if (r5 != null) {

            EquipmentAllocation ea1 =
                    EquipmentAllocation.builder()
                            .equipment(r5)
                            .booking(savedB2)
                            .photographer(kavindu)
                            .allocatedBy(nadun)
                            .notes(
                                    "Primary camera body allocated."
                            )
                            .build();

            allocationRepository.save(ea1);

            r5.setStatus(
                    EquipmentStatus.ALLOCATED
            );

            equipmentRepository.save(r5);
        }

        // =====================================================
        // BOOKING 3
        // Upcoming Confirmed Booking
        // =====================================================

        Booking b3 =
                Booking.builder()
                        .bookingRef(
                                "SF-2026-0003"
                        )
                        .customer(afrith)
                        .photographyPackage(
                                birthday
                        )
                        .eventDate(
                                today.plusDays(14)
                        )
                        .startTime(
                                LocalTime.of(16, 0)
                        )
                        .endTime(
                                LocalTime.of(19, 0)
                        )
                        .venue(
                                "Waters Edge, Battaramulla"
                        )
                        .eventType(
                                "21st Birthday Bash"
                        )
                        .status(
                                BookingStatus.CONFIRMED
                        )
                        .packagePrice(
                                birthday.getPrice()
                        )
                        .addOnsPrice(
                                BigDecimal.ZERO
                        )
                        .additionalCharges(
                                BigDecimal.ZERO
                        )
                        .totalAmount(
                                birthday.getPrice()
                        )
                        .paidAmount(
                                new BigDecimal(
                                        "15000.00"
                                )
                        )
                        .balanceAmount(
                                birthday
                                        .getPrice()
                                        .subtract(
                                                new BigDecimal(
                                                        "15000.00"
                                                )
                                        )
                        )
                        .build();

        Booking savedB3 =
                bookingRepository.save(b3);

        Payment pay3 =
                Payment.builder()
                        .booking(savedB3)
                        .transactionReference(
                                "TXN-DEP-003"
                        )
                        .amount(
                                new BigDecimal(
                                        "15000.00"
                                )
                        )
                        .paymentType(
                                PaymentType.ADVANCE_DEPOSIT
                        )
                        .status(
                                PaymentStatus.VERIFIED
                        )
                        .verifiedBy(
                                financeUser
                        )
                        .verificationNotes(
                                "Advance deposit verified."
                        )
                        .build();

        paymentRepository.save(pay3);

        // =====================================================
        // FEEDBACK
        // =====================================================

        Feedback fb1 =
                Feedback.builder()
                        .customer(afrith)
                        .name(
                                afrith.getFullName()
                        )
                        .email(
                                afrith.getEmail()
                        )
                        .type(
                                FeedbackType.SUGGESTION
                        )
                        .subject(
                                "Adding drone video teaser"
                        )
                        .message(
                                "Would love to see short 15-second vertical video clips added to future packages!"
                        )
                        .status(
                                FeedbackStatus.PENDING
                        )
                        .build();

        feedbackRepository.save(fb1);

        // =====================================================
        // NOTIFICATIONS
        // =====================================================

        notificationRepository.save(
                Notification.builder()
                        .user(afrith)
                        .title(
                                "Gallery Published"
                        )
                        .message(
                                "Your wedding photos are ready to view and download."
                        )
                        .type("GALLERY")
                        .link(
                                "/customer/galleries/"
                                        + savedGal1.getId()
                        )
                        .isRead(false)
                        .build()
        );

        notificationRepository.save(
                Notification.builder()
                        .user(nethuli)
                        .title(
                                "New Review Received"
                        )
                        .message(
                                "Afrith rated you 5 stars for the Shangri-La wedding reception."
                        )
                        .type("REVIEW")
                        .link(
                                "/photographer/coverage"
                        )
                        .isRead(false)
                        .build()
        );
    }
}